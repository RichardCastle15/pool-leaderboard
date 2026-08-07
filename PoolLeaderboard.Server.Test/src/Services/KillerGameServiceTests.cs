using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Killer;

namespace PoolLeaderboard.Server.Test.Services;

public class KillerGameServiceTests
{
    private readonly KillerGameService service = MakeService();

    private static (KillerGameService Service, IKillerGameInProgressRepository Repo) MakeServiceWithRepo(Random? random = null)
    {
        var scopeFactory = Substitute.For<IServiceScopeFactory>();
        var scope = Substitute.For<IServiceScope>();
        var repo = Substitute.For<IKillerGameInProgressRepository>();
        scopeFactory.CreateScope().Returns(scope);
        scope.ServiceProvider.GetService(typeof(IKillerGameInProgressRepository)).Returns(repo);
        var service = random == null
            ? new KillerGameService(scopeFactory)
            : new KillerGameService(random, scopeFactory);
        return (service, repo);
    }

    private static KillerGameService MakeService(Random? random = null) => MakeServiceWithRepo(random).Service;

    [Fact]
    public void IsActive_ReturnsFalse_BeforeStart()
    {
        Assert.False(service.IsActive);
    }

    [Fact]
    public void IsActive_ReturnsTrue_AfterStart()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        Assert.True(service.IsActive);
    }

    [Fact]
    public void GetStateDto_ReturnsInactiveDto_WhenNoGame()
    {
        var state = service.GetStateDto();

        Assert.False(state.IsActive);
    }

    [Fact]
    public void GetStateDto_ReturnsPlayerRows_AfterStart()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        var state = service.GetStateDto();

        Assert.Equal(2, state.PlayerRows.Count);
        Assert.Contains(state.PlayerRows, r => r.Name == "Alice");
        Assert.Contains(state.PlayerRows, r => r.Name == "Bob");
    }

    [Fact]
    public void GetStateDto_SetsSurvivingPlayersAsNotEliminated()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        var state = service.GetStateDto();

        Assert.False(state.PlayerRows[0].Eliminated);
        Assert.False(state.PlayerRows[1].Eliminated);
    }

    [Fact]
    public void GetStateDto_SetsEliminatedTrue_ForPlayerWithNoLives()
    {
        // Use a seeded random so Alice is always first (and thus eliminated by EarlyBlackPot)
        var seededService = MakeService(new Random(0));
        seededService.StartGame([(1, "Alice"), (2, "Bob")]);
        seededService.EarlyBlackPot(); // current player loses all lives

        var state = seededService.GetStateDto();

        Assert.Contains(state.PlayerRows, r => r.Eliminated);
    }

    [Fact]
    public void GetStateDto_SetsWinnerNull_WhenMultiplePlayersAlive()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        var state = service.GetStateDto();

        Assert.Null(state.Winner);
    }

    [Fact]
    public void GetStateDto_SetsWinner_WhenOnePlayerRemains()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        var firstPlayer = service.GetStateDto().PlayerRows[0].Name;
        service.EarlyBlackPot(); // first player eliminated -> other player wins

        var state = service.GetStateDto();

        var expectedWinner = firstPlayer == "Alice" ? "Bob" : "Alice";
        Assert.Equal(expectedWinner, state.Winner);
    }

    [Fact]
    public void GetWinnerName_ReturnsNull_WhenNoGame()
    {
        Assert.Null(service.GetWinnerName());
    }

    [Fact]
    public void GetWinnerName_ReturnsNull_WhenMultiplePlayersAlive()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        Assert.Null(service.GetWinnerName());
    }

    [Fact]
    public void GetWinnerName_ReturnsName_WhenOnePlayerRemains()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        var firstPlayer = service.GetStateDto().PlayerRows[0].Name;
        service.EarlyBlackPot(); // first player eliminated -> other player wins

        var expectedWinner = firstPlayer == "Alice" ? "Bob" : "Alice";
        Assert.Equal(expectedWinner, service.GetWinnerName());
    }

    [Fact]
    public void GetPlayers_ReturnsNull_BeforeStart()
    {
        Assert.Null(service.GetPlayers());
    }

    [Fact]
    public void GetPlayers_ReturnsPlayers_AfterStart()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);

        var players = service.GetPlayers();

        Assert.NotNull(players);
        Assert.Equal(2, players.Count);
        Assert.Contains((1, "Alice"), players);
        Assert.Contains((2, "Bob"), players);
    }

    [Fact]
    public void EndGame_SetsIsActiveFalse()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.EndGame();

        Assert.False(service.IsActive);
    }

    [Fact]
    public void EndGame_ClearsPlayers()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.EndGame();

        Assert.Null(service.GetPlayers());
    }

    [Fact]
    public void StartGame_ShufflesPlayerOrder()
    {
        // Run enough games with a fresh Random to observe at least one non-original ordering.
        // With 4 players there are 24 permutations; the chance of always staying in order
        // across 20 independent shuffles is (1/24)^20 ≈ 10^-27 — effectively impossible.
        var players = new[] { (1, "Alice"), (2, "Bob"), (3, "Charlie"), (4, "Dave") };
        bool sawDifferentOrder = false;

        for (int i = 0; i < 20; i++)
        {
            var svc = MakeService();
            svc.StartGame(players);
            var names = svc.GetStateDto().PlayerRows.Select(r => r.Name).ToList();
            if (!names.SequenceEqual(players.Select(p => p.Item2)))
            {
                sawDifferentOrder = true;
                break;
            }
        }

        Assert.True(sawDifferentOrder, "Players were never shuffled after 20 attempts");
    }

    [Fact]
    public void StartGame_ReplacesExistingGame()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.StartGame([(3, "Charlie")]);

        var state = service.GetStateDto();

        Assert.Single(state.PlayerRows);
        Assert.Equal("Charlie", state.PlayerRows[0].Name);
    }

    [Fact]
    public void StartGame_PersistsState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        repo.Received(1).Save(Arg.Any<KillerGameInProgressState>());
    }

    [Fact]
    public void Pot_PersistsState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        repo.ClearReceivedCalls();
        svc.Pot();
        repo.Received(1).Save(Arg.Any<KillerGameInProgressState>());
    }

    [Fact]
    public void Miss_PersistsState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        repo.ClearReceivedCalls();
        svc.Miss();
        repo.Received(1).Save(Arg.Any<KillerGameInProgressState>());
    }

    [Fact]
    public void EarlyBlackPot_PersistsState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        repo.ClearReceivedCalls();
        svc.EarlyBlackPot();
        repo.Received(1).Save(Arg.Any<KillerGameInProgressState>());
    }

    [Fact]
    public void Undo_PersistsState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        svc.Miss();
        repo.ClearReceivedCalls();
        svc.Undo();
        repo.Received(1).Save(Arg.Any<KillerGameInProgressState>());
    }

    [Fact]
    public void EndGame_DeletesPersistedState()
    {
        var (svc, repo) = MakeServiceWithRepo();
        svc.StartGame([(1, "Alice"), (2, "Bob")]);
        svc.EndGame();
        repo.Received(1).Delete();
    }

    [Fact]
    public void TryRestore_RestoresGameState()
    {
        var (svc, _) = MakeServiceWithRepo();
        var persisted = new KillerGameInProgressState(
            CurrentPlayerIndex: 1,
            SuddenDeathState: "NotActive",
            ActionStackJson: "[]",
            Players:
            [
                new KillerGameInProgressPlayer(RatingId: 1, PlayerName: "Alice", TurnOrder: 0, LivesRemaining: 3, MissedInSuddenDeath: false),
                new KillerGameInProgressPlayer(RatingId: 2, PlayerName: "Bob", TurnOrder: 1, LivesRemaining: 2, MissedInSuddenDeath: false)
            ]
        );
        var repo = Substitute.For<IKillerGameInProgressRepository>();
        repo.Load().Returns(persisted);

        svc.TryRestore(repo);

        Assert.True(svc.IsActive);
        var state = svc.GetStateDto();
        Assert.Equal(1, state.CurrentPlayerIndex);
        Assert.Equal(2, state.PlayerRows.Count);
        Assert.Equal("Alice", state.PlayerRows[0].Name);
        Assert.Equal(3, state.PlayerRows[0].LivesRemaining);
        Assert.Equal("Bob", state.PlayerRows[1].Name);
        Assert.Equal(2, state.PlayerRows[1].LivesRemaining);
    }

    [Fact]
    public void TryRestore_DoesNothing_WhenNothingPersisted()
    {
        var (svc, _) = MakeServiceWithRepo();
        var repo = Substitute.For<IKillerGameInProgressRepository>();
        repo.Load().Returns((KillerGameInProgressState?)null);

        svc.TryRestore(repo);

        Assert.False(svc.IsActive);
    }

    [Fact]
    public void Pot_AdvancesCurrentPlayer()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.Pot();

        var state = service.GetStateDto();

        Assert.Equal(1, state.CurrentPlayerIndex);
    }

    [Fact]
    public void Miss_DeductsALife()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.Miss();

        var state = service.GetStateDto();

        // The current player (index 0) loses a life; whoever ended up first has 2 lives left
        Assert.Equal(2, state.PlayerRows[0].LivesRemaining);
    }

    [Fact]
    public void Undo_ReversesLastAction()
    {
        service.StartGame([(1, "Alice"), (2, "Bob")]);
        service.Miss();
        service.Undo();

        var state = service.GetStateDto();

        Assert.Equal(0, state.CurrentPlayerIndex);
        Assert.Equal(3, state.PlayerRows[0].LivesRemaining);
    }
}
