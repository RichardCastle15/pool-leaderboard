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
        repository.ExistsByName("Alice B").Returns(false);

        await controller.Post(new AddParticipantBody { Name = "Alice B" });

        repository.Received(1).Add("Alice B");
    }

    [Fact]
    public async Task Post_BroadcastsUpdatedLeaderboard()
    {
        repository.ExistsByName("Alice B").Returns(false);
        var entries = new List<LeaderboardEntry> { new() { Name = "Alice B", Rating = 1000, Id = 1 } };
        repository.GetAll().Returns(entries);

        await controller.Post(new AddParticipantBody { Name = "Alice B" });

        await allClients.Received(1).SendCoreAsync(
            "ReceiveLeaderboard",
            Arg.Is<object?[]>(args => args[0] == entries),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Post_ReturnsOk()
    {
        repository.ExistsByName("Alice B").Returns(false);

        var result = await controller.Post(new AddParticipantBody { Name = "Alice B" });

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Post_ReturnsConflict_WhenNameAlreadyExists()
    {
        repository.ExistsByName("Alice B").Returns(true);

        var result = await controller.Post(new AddParticipantBody { Name = "Alice B" });

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task Post_DoesNotAddParticipant_WhenNameAlreadyExists()
    {
        repository.ExistsByName("Alice B").Returns(true);

        await controller.Post(new AddParticipantBody { Name = "Alice B" });

        repository.DidNotReceive().Add(Arg.Any<string>());
    }

    [Fact]
    public async Task Post_DoesNotBroadcast_WhenNameAlreadyExists()
    {
        repository.ExistsByName("Alice B").Returns(true);

        await controller.Post(new AddParticipantBody { Name = "Alice B" });

        await allClients.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(),
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Theory]
    [InlineData("Alice")]
    [InlineData("Alice  ")]
    [InlineData("  Alice  ")]
    [InlineData("")]
    public async Task Post_ReturnsBadRequest_WhenNameHasNoInitialOrSurname(string name)
    {
        var result = await controller.Post(new AddParticipantBody { Name = name });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData("Alice B")]
    [InlineData("Alice Baker")]
    [InlineData("Richard Castle")]
    [InlineData("Richard C")]
    public async Task Post_AcceptsName_WhenNameHasFirstNameAndInitialOrSurname(string name)
    {
        repository.ExistsByName(name).Returns(false);

        var result = await controller.Post(new AddParticipantBody { Name = name });

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Post_DoesNotAddParticipant_WhenNameIsInvalid()
    {
        var result = await controller.Post(new AddParticipantBody { Name = "Alice" });

        repository.DidNotReceive().Add(Arg.Any<string>());
    }

    [Fact]
    public async Task Post_DoesNotBroadcast_WhenNameIsInvalid()
    {
        await controller.Post(new AddParticipantBody { Name = "Alice" });

        await allClients.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(),
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>()
        );
    }
}
