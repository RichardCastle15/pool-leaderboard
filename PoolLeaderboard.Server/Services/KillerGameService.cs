using PoolLeaderboardEngine.Killer;

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

public class KillerGameService
{
    private KillerGame? _currentGame;
    private List<(int Id, string Name)>? _players;
    private readonly object _lock = new();

    public bool IsActive
    {
        get { lock (_lock) { return _currentGame != null; } }
    }

    public void StartGame(IEnumerable<(int Id, string Name)> players)
    {
        lock (_lock)
        {
            _players = players.ToList();
            _currentGame = new KillerGame(_players.Select(p => p.Name));
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

    public void Pot()
    {
        lock (_lock) { _currentGame?.Pot(); }
    }

    public void Miss()
    {
        lock (_lock) { _currentGame?.Miss(); }
    }

    public void EarlyBlackPot()
    {
        lock (_lock) { _currentGame?.EarlyBlackPot(); }
    }

    public void Undo()
    {
        lock (_lock) { _currentGame?.Undo(); }
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
            _currentGame = null;
            _players = null;
        }
    }

    private static string? GetWinnerFromState(KillerGameState state)
    {
        var alive = state.PlayerRows.Where(r => r.LivesRemaining > 0).ToList();
        return alive.Count == 1 ? alive[0].PlayerName : null;
    }
}
