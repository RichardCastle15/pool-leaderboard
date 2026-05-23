using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Test.Controllers;

public class KillerControllerTests
{
    private readonly KillerGameService killerGameService;
    private readonly ILeaderboardRepository leaderboardRepository;
    private readonly IKillerGameRepository killerGameRepository;
    private readonly IClientProxy allKillerClients;
    private readonly IClientProxy allLeaderboardClients;
    private readonly KillerController controller;

    public KillerControllerTests()
    {
        killerGameService = new KillerGameService();
        leaderboardRepository = Substitute.For<ILeaderboardRepository>();
        killerGameRepository = Substitute.For<IKillerGameRepository>();

        allKillerClients = Substitute.For<IClientProxy>();
        var killerHubClients = Substitute.For<IHubClients>();
        killerHubClients.All.Returns(allKillerClients);
        var killerHubContext = Substitute.For<IHubContext<KillerHub>>();
        killerHubContext.Clients.Returns(killerHubClients);

        allLeaderboardClients = Substitute.For<IClientProxy>();
        var leaderboardHubClients = Substitute.For<IHubClients>();
        leaderboardHubClients.All.Returns(allLeaderboardClients);
        var leaderboardHubContext = Substitute.For<IHubContext<LeaderboardHub>>();
        leaderboardHubContext.Clients.Returns(leaderboardHubClients);

        controller = new KillerController(killerGameService, killerHubContext, leaderboardHubContext, leaderboardRepository, killerGameRepository);
    }

    #region POST /api/killer

    [Fact]
    public async Task Post_StartsGameWithCorrectPlayers()
    {
        var request = new StartKillerGameRequest
        {
            Players = [new KillerPlayerDto { Id = 1, Name = "Alice" }, new KillerPlayerDto { Id = 2, Name = "Bob" }]
        };

        await controller.StartGame(request);

        Assert.True(killerGameService.IsActive);
        var players = killerGameService.GetPlayers();
        Assert.NotNull(players);
        Assert.Contains((1, "Alice"), players);
        Assert.Contains((2, "Bob"), players);
    }

    [Fact]
    public async Task Post_BroadcastsGameState()
    {
        var request = new StartKillerGameRequest
        {
            Players = [new KillerPlayerDto { Id = 1, Name = "Alice" }]
        };

        await controller.StartGame(request);

        await allKillerClients.Received(1).SendCoreAsync(
            "ReceiveKillerGame",
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Post_ReturnsOk()
    {
        var request = new StartKillerGameRequest
        {
            Players = [new KillerPlayerDto { Id = 1, Name = "Alice" }]
        };

        var result = await controller.StartGame(request);

        Assert.IsType<OkResult>(result);
    }

    #endregion

    #region DELETE /api/killer

    [Fact]
    public async Task Delete_ReturnsBadRequest_WhenNoGameActive()
    {
        var result = await controller.ConfirmEnd();

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsBadRequest_WhenNoWinnerYet()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        // No actions taken — two players alive, no winner

        var result = await controller.ConfirmEnd();

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Delete_UpdatesWinnerRating_WithCorrectDelta()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        // Determine which player is first (and will be eliminated by EarlyBlackPot)
        var firstPlayerId = killerGameService.GetStateDto().PlayerRows[0].Name == "Alice" ? 1 : 2;
        var winnerId = firstPlayerId == 1 ? 2 : 1;
        killerGameService.EarlyBlackPot(); // first player eliminated -> other wins

        await controller.ConfirmEnd();

        // Winner in a 2-player game: +10 * (2-1) = +10
        leaderboardRepository.Received(1).UpdateRating(winnerId, 10);
    }

    [Fact]
    public async Task Delete_UpdatesLoserRating_WithNegativeDelta()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        // Determine which player is first (and will be eliminated by EarlyBlackPot)
        var firstPlayerId = killerGameService.GetStateDto().PlayerRows[0].Name == "Alice" ? 1 : 2;
        killerGameService.EarlyBlackPot(); // first player eliminated

        await controller.ConfirmEnd();

        // Eliminated player is loser: -10
        leaderboardRepository.Received(1).UpdateRating(firstPlayerId, -10);
    }

    [Fact]
    public async Task Delete_WinnerGetsPointsPerPlayer_InLargerGame()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob"), (3, "Charlie")]);
        // Record which player ends up last (the winner) after two EarlyBlackPots
        var rows = killerGameService.GetStateDto().PlayerRows;
        var winnerName = rows[2].Name;
        var winnerId = winnerName == "Alice" ? 1 : winnerName == "Bob" ? 2 : 3;
        killerGameService.EarlyBlackPot(); // first player eliminated
        killerGameService.EarlyBlackPot(); // second player eliminated -> last player wins

        await controller.ConfirmEnd();

        // Winner in 3-player game: +10 * (3-1) = +20
        leaderboardRepository.Received(1).UpdateRating(winnerId, 20);
    }

    [Fact]
    public async Task Delete_EndsGame_AfterConfirming()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot();

        await controller.ConfirmEnd();

        Assert.False(killerGameService.IsActive);
    }

    [Fact]
    public async Task Delete_BroadcastsKillerGameEnded()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot();

        await controller.ConfirmEnd();

        await allKillerClients.Received(1).SendCoreAsync(
            "KillerGameEnded",
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Delete_BroadcastsUpdatedLeaderboard()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot();
        var entries = new List<LeaderboardEntry> { new() { Name = "Bob", Rating = 1010, Id = 2 } };
        leaderboardRepository.GetAll().Returns(entries);

        await controller.ConfirmEnd();

        await allLeaderboardClients.Received(1).SendCoreAsync(
            "ReceiveLeaderboard",
            Arg.Is<object?[]>(args => args[0] == entries),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Delete_ReturnsOk_WhenGameHasWinner()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot();

        var result = await controller.ConfirmEnd();

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Delete_PersistsKillerGame_WithExpectedDeltas()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob"), (3, "Charlie")]);
        // Record which player ends up last (the winner) after two EarlyBlackPots
        var rows = killerGameService.GetStateDto().PlayerRows;
        var winnerName = rows[2].Name;
        var winnerId = winnerName == "Alice" ? 1 : winnerName == "Bob" ? 2 : 3;
        killerGameService.EarlyBlackPot(); // first player eliminated
        killerGameService.EarlyBlackPot(); // second player eliminated -> last player wins

        await controller.ConfirmEnd();

        killerGameRepository.Received(1).Add(Arg.Is<IReadOnlyList<KillerGamePlayerRecord>>(list =>
            list.Count == 3 &&
            list.Single(p => p.PlayerId == winnerId).Delta == 20 &&
            list.Single(p => p.PlayerId == winnerId).IsWinner == true &&
            list.Where(p => p.PlayerId != winnerId).All(p => p.Delta == -10) &&
            list.Where(p => p.PlayerId != winnerId).All(p => p.IsWinner == false)));
    }

    [Fact]
    public async Task Delete_DoesNotUpdateRatings_WhenHistoryInsertThrows()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot();
        killerGameRepository
            .When(r => r.Add(Arg.Any<IReadOnlyList<KillerGamePlayerRecord>>()))
            .Do(_ => throw new InvalidOperationException("db error"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => controller.ConfirmEnd());

        leaderboardRepository.DidNotReceive().UpdateRating(Arg.Any<int>(), Arg.Any<int>());
    }

    #endregion
}
