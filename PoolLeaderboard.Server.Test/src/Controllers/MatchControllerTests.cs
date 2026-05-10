using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Match;

namespace PoolLeaderboard.Server.Test.Controllers;

public class MatchControllerTests
{
    private readonly ILeaderboardRepository leaderboardRepository = Substitute.For<ILeaderboardRepository>();
    private readonly IMatchRepository matchRepository = Substitute.For<IMatchRepository>();
    private readonly IClientProxy allLeaderboardClients;
    private readonly MatchController controller;

    public MatchControllerTests()
    {
        allLeaderboardClients = Substitute.For<IClientProxy>();
        var leaderboardHubClients = Substitute.For<IHubClients>();
        leaderboardHubClients.All.Returns(allLeaderboardClients);
        var leaderboardHubContext = Substitute.For<IHubContext<LeaderboardHub>>();
        leaderboardHubContext.Clients.Returns(leaderboardHubClients);

        controller = new MatchController(leaderboardRepository, matchRepository, leaderboardHubContext);
    }

    private void SetupPlayers(params LeaderboardEntry[] entries)
    {
        leaderboardRepository.GetAll().Returns(entries.ToList());
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenWinnerEqualsLoser()
    {
        SetupPlayers(new LeaderboardEntry { Id = 1, Name = "Alice", Rating = 1000 });

        var result = await controller.RecordResult(new() { WinnerId = 1, LoserId = 1 });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenWinnerMissing()
    {
        SetupPlayers(new LeaderboardEntry { Id = 2, Name = "Bob", Rating = 1000 });

        var result = await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenLoserMissing()
    {
        SetupPlayers(new LeaderboardEntry { Id = 1, Name = "Alice", Rating = 1000 });

        var result = await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Post_EqualRatings_UpdatesWinnerByFifty()
    {
        SetupPlayers(
            new() { Id = 1, Name = "Alice", Rating = 1000 },
            new() { Id = 2, Name = "Bob", Rating = 1000 });

        await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        leaderboardRepository.Received(1).UpdateRating(1, 50);
        leaderboardRepository.Received(1).UpdateRating(2, -50);
    }

    [Fact]
    public async Task Post_FourHundredGap_LowerWins_AppliesNinetyOne()
    {
        SetupPlayers(
            new() { Id = 1, Name = "Alice", Rating = 1000 },
            new() { Id = 2, Name = "Bob", Rating = 1400 });

        await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        leaderboardRepository.Received(1).UpdateRating(1, 91);
        leaderboardRepository.Received(1).UpdateRating(2, -91);
    }

    [Fact]
    public async Task Post_PersistsMatchRow()
    {
        SetupPlayers(
            new() { Id = 1, Name = "Alice", Rating = 1000 },
            new() { Id = 2, Name = "Bob", Rating = 1000 });

        await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        matchRepository.Received(1).Add(1, 2, 50, -50);
    }

    [Fact]
    public async Task Post_BroadcastsUpdatedLeaderboard()
    {
        var initial = new List<LeaderboardEntry>
        {
            new() { Id = 1, Name = "Alice", Rating = 1000 },
            new() { Id = 2, Name = "Bob", Rating = 1000 }
        };
        var updated = new List<LeaderboardEntry>
        {
            new() { Id = 1, Name = "Alice", Rating = 1050 },
            new() { Id = 2, Name = "Bob", Rating = 950 }
        };
        leaderboardRepository.GetAll().Returns(initial, updated);

        await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        await allLeaderboardClients.Received(1).SendCoreAsync(
            "ReceiveLeaderboard",
            Arg.Is<object?[]>(args => args[0] == updated),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Post_ReturnsOk_OnSuccess()
    {
        SetupPlayers(
            new() { Id = 1, Name = "Alice", Rating = 1000 },
            new() { Id = 2, Name = "Bob", Rating = 1000 });

        var result = await controller.RecordResult(new() { WinnerId = 1, LoserId = 2 });

        Assert.IsType<OkObjectResult>(result);
    }
}
