using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Killer.GameActions;

namespace PoolLeaderboard.Server.Services;

public class KillerGameStateDto
{
    public bool IsActive { get; set; }
    public int CurrentPlayerIndex { get; set; }
    public List<KillerGameRowDto> PlayerRows { get; set; } = [];
    public string? Winner { get; set; }
}

public class KillerGameRowDto
{
    public required string Name { get; set; }
    public int LivesRemaining { get; set; }
    public bool MissedInSuddenDeath { get; set; }
    public bool Eliminated { get; set; }
}

/// <summary>
/// Thrown by <see cref="KillerGameService.StartGame"/> when a game is already in progress and the caller
/// did not ask to replace it. Carries who is in the existing game, and who has won it if it is finished
/// but not yet settled, so the caller can say so.
/// </summary>
public class KillerGameInProgressException(IReadOnlyList<string> playerNames, string? winner)
    : InvalidOperationException("A killer game is already in progress.")
{
    public IReadOnlyList<string> PlayerNames { get; } = playerNames;
    public string? Winner { get; } = winner;
}

public class KillerGameService
{
    private KillerGame? _currentGame;
    private List<(int Id, string Name)>? _players;
    private readonly object _lock = new();
    private readonly Random _random;
    private readonly IServiceScopeFactory _scopeFactory;

    public KillerGameService(IServiceScopeFactory scopeFactory) : this(Random.Shared, scopeFactory) { }

    public KillerGameService(Random random, IServiceScopeFactory scopeFactory)
    {
        _random = random;
        _scopeFactory = scopeFactory;
    }

    public bool IsActive
    {
        get { lock (_lock) { return _currentGame != null; } }
    }

    /// <summary>
    /// Starts a new game. A game already in progress - including one that has a winner but hasn't been
    /// settled by ConfirmEnd yet, since its result isn't on the leaderboard - is only replaced when
    /// <paramref name="replaceExisting"/> is true (which abandons it, exactly like <see cref="EndGame"/>);
    /// otherwise this throws <see cref="KillerGameInProgressException"/> and leaves it untouched.
    /// The check and the replacement happen under one lock so two devices can't race past each other.
    /// </summary>
    public void StartGame(IEnumerable<(int Id, string Name)> players, bool replaceExisting = false)
    {
        lock (_lock)
        {
            if (_currentGame != null && !replaceExisting)
                throw new KillerGameInProgressException(
                    _players!.Select(p => p.Name).ToList(), GetWinnerFromState(_currentGame.GetState()));

            var newPlayers = players.ToList();
            _random.Shuffle(CollectionsMarshal.AsSpan(newPlayers));
            var newGame = new KillerGame(newPlayers.Select(p => p.Name));

            if (_currentGame != null)
                EndGame();

            _players = newPlayers;
            _currentGame = newGame;
            PersistCurrentState();
        }
    }

    public KillerGameStateDto GetStateDto()
    {
        lock (_lock)
        {
            if (_currentGame == null)
                return new KillerGameStateDto { IsActive = false };

            var state = _currentGame.GetState();
            var winner = GetWinnerFromState(state);

            return new KillerGameStateDto
            {
                IsActive = true,
                CurrentPlayerIndex = state.CurrentPlayerIndex,
                PlayerRows = state.PlayerRows.Select(r => new KillerGameRowDto
                {
                    Name = r.PlayerName,
                    LivesRemaining = r.LivesRemaining,
                    MissedInSuddenDeath = r.MissedInSuddenDeath,
                    Eliminated = r.LivesRemaining == 0
                }).ToList(),
                Winner = winner
            };
        }
    }

    public void Pot() => Mutate(game => game.Pot());

    public void Miss() => Mutate(game => game.Miss());

    public void EarlyBlackPot() => Mutate(game => game.EarlyBlackPot());

    public void Undo() => Mutate(game => game.Undo());

    /// <summary>
    /// Runs a mutation against the in-progress game and persists the result, so that
    /// "every mutation persists" is enforced in one place rather than by each caller.
    /// Does nothing when no game is in progress.
    /// </summary>
    private void Mutate(Action<KillerGame> mutation)
    {
        lock (_lock)
        {
            if (_currentGame == null) return;
            mutation(_currentGame);
            PersistCurrentState();
        }
    }

    public string? GetWinnerName()
    {
        lock (_lock)
        {
            if (_currentGame == null) return null;
            return GetWinnerFromState(_currentGame.GetState());
        }
    }

    public List<(int Id, string Name)>? GetPlayers()
    {
        lock (_lock) { return _players; }
    }

    public void EndGame()
    {
        lock (_lock)
        {
            // Delete first: if the delete throws, in-memory state still matches the DB row and
            // the caller sees the failure, rather than the game vanishing from memory while a
            // stale row survives to be resurrected by the next TryRestore().
            DeletePersistedState();
            _currentGame = null;
            _players = null;
        }
    }

    /// <summary>
    /// Restores a game persisted by a previous run of the process, if there is one.
    /// Everything is rebuilt before anything is assigned, so a malformed row throws without
    /// leaving the service half-restored.
    /// </summary>
    public void TryRestore(IKillerGameInProgressRepository repo)
    {
        var persisted = repo.Load();
        if (persisted == null) return;

        var orderedPlayers = persisted.Players.OrderBy(p => p.TurnOrder).ToList();

        var state = new KillerGameState
        {
            CurrentPlayerIndex = persisted.CurrentPlayerIndex,
            SuddenDeathState = Enum.Parse<SuddenDeathState>(persisted.SuddenDeathState),
            PlayerRows = orderedPlayers
                .Select(p => new KillerGameRow
                {
                    PlayerName = p.PlayerName,
                    LivesRemaining = p.LivesRemaining,
                    MissedInSuddenDeath = p.MissedInSuddenDeath
                })
                .ToList<KillerGameRow>()
        };

        var actions = JsonSerializer.Deserialize<KillerGameActionRecord[]>(persisted.ActionStackJson)
            ?? [];
        var restoredGame = new KillerGame(state, actions);

        lock (_lock)
        {
            _players = orderedPlayers.Select(p => (p.RatingId, p.PlayerName)).ToList();
            _currentGame = restoredGame;
        }
    }

    private void PersistCurrentState()
    {
        var state = _currentGame!.GetState();
        var actionStack = _currentGame!.GetActionStack();
        var actionStackJson = JsonSerializer.Serialize(actionStack);

        var persistedState = new KillerGameInProgressState(
            CurrentPlayerIndex: state.CurrentPlayerIndex,
            SuddenDeathState: state.SuddenDeathState.ToString(),
            ActionStackJson: actionStackJson,
            Players: _players!.Select((p, i) => new KillerGameInProgressPlayer(
                RatingId: p.Id,
                PlayerName: p.Name,
                TurnOrder: i,
                LivesRemaining: state.PlayerRows[i].LivesRemaining,
                MissedInSuddenDeath: state.PlayerRows[i].MissedInSuddenDeath
            )).ToList()
        );

        using var scope = _scopeFactory.CreateScope();
        scope.ServiceProvider.GetRequiredService<IKillerGameInProgressRepository>().Save(persistedState);
    }

    private void DeletePersistedState()
    {
        using var scope = _scopeFactory.CreateScope();
        scope.ServiceProvider.GetRequiredService<IKillerGameInProgressRepository>().Delete();
    }

    private static string? GetWinnerFromState(KillerGameState state)
    {
        var alive = state.PlayerRows.Where(r => r.LivesRemaining > 0).ToList();
        return alive.Count == 1 ? alive[0].PlayerName : null;
    }
}
