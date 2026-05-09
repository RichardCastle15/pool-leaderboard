using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Test.Controllers;

public class KillerControllerTests
{
    private readonly KillerGameService killerGameService;
    private readonly ILeaderboardRepository leaderboardRepository;
    private readonly IClientProxy allKillerClients;
    private readonly IClientProxy allLeaderboardClients;
    private readonly KillerController controller;

    public KillerControllerTests()
    {
        killerGameService = new KillerGameService();
        leaderboardRepository = Substitute.For<ILeaderboardRepository>();

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

        controller = new KillerController(killerGameService, killerHubContext, leaderboardHubContext, leaderboardRepository);
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
        killerGameService.EarlyBlackPot(); // Alice eliminated -> Bob wins

        await controller.ConfirmEnd();

        // Bob (id=2) is winner in a 2-player game: +10 * (2-1) = +10
        leaderboardRepository.Received(1).UpdateRating(2, 10);
    }

    [Fact]
    public async Task Delete_UpdatesLoserRating_WithNegativeDelta()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob")]);
        killerGameService.EarlyBlackPot(); // Alice eliminated -> Bob wins

        await controller.ConfirmEnd();

        // Alice (id=1) is loser: -10
        leaderboardRepository.Received(1).UpdateRating(1, -10);
    }

    [Fact]
    public async Task Delete_WinnerGetsPointsPerPlayer_InLargerGame()
    {
        killerGameService.StartGame([(1, "Alice"), (2, "Bob"), (3, "Charlie")]);
        killerGameService.EarlyBlackPot(); // Alice eliminated
        killerGameService.EarlyBlackPot(); // Bob eliminated -> Charlie wins

        await controller.ConfirmEnd();

        // Charlie (id=3) wins 3-player game: +10 * (3-1) = +20
        leaderboardRepository.Received(1).UpdateRating(3, 20);
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

    #endregion
}
