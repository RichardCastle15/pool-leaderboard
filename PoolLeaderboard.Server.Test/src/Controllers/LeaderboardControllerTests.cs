using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Test.Controllers;

public class LeaderboardControllerTests
{
    private readonly ILeaderboardRepository repository;
    private readonly IClientProxy allClients;
    private readonly LeaderboardController controller;

    public LeaderboardControllerTests()
    {
        repository = Substitute.For<ILeaderboardRepository>();

        allClients = Substitute.For<IClientProxy>();
        var hubClients = Substitute.For<IHubClients>();
        hubClients.All.Returns(allClients);
        var hubContext = Substitute.For<IHubContext<LeaderboardHub>>();
        hubContext.Clients.Returns(hubClients);

        controller = new LeaderboardController(repository, hubContext);
    }

    [Fact]
    public async Task Post_AddsParticipantWithCorrectName()
    {
        await controller.Post(new AddParticipantBody { Name = "Alice" });

        repository.Received(1).Add("Alice");
    }

    [Fact]
    public async Task Post_BroadcastsUpdatedLeaderboard()
    {
        var entries = new List<LeaderboardEntry> { new() { Name = "Alice", Rating = 1000, Id = 1 } };
        repository.GetAll().Returns(entries);

        await controller.Post(new AddParticipantBody { Name = "Alice" });

        await allClients.Received(1).SendCoreAsync(
            "ReceiveLeaderboard",
            Arg.Is<object?[]>(args => args[0] == entries),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Post_ReturnsOk()
    {
        var result = await controller.Post(new AddParticipantBody { Name = "Alice" });

        Assert.IsType<OkResult>(result);
    }
}
