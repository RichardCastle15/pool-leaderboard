using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboardEngine.MatchHistory;

namespace PoolLeaderboard.Server.Test.Controllers;

public class MatchHistoryControllerTests
{
    private readonly IMatchHistoryRepository matchHistoryRepository = Substitute.For<IMatchHistoryRepository>();
    private readonly MatchHistoryController controller;

    public MatchHistoryControllerTests()
    {
        controller = new MatchHistoryController(matchHistoryRepository);
    }

    [Fact]
    public void Get_ReturnsOk_WithRepositoryPage()
    {
        var page = new MatchHistoryPage { Total = 1, Items = new List<MatchHistoryEntry>() };
        matchHistoryRepository.GetPage(0, 10).Returns(page);

        var result = controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Same(page, ok.Value);
    }

    [Fact]
    public void Get_DefaultsToSkip0Take10_WhenUnspecified()
    {
        controller.Get();

        matchHistoryRepository.Received(1).GetPage(0, 10);
    }

    [Fact]
    public void Get_ReturnsBadRequest_OnNegativeSkip()
    {
        var result = controller.Get(skip: -1);

        Assert.IsType<BadRequestObjectResult>(result);
        matchHistoryRepository.DidNotReceive().GetPage(Arg.Any<int>(), Arg.Any<int>());
    }

    [Fact]
    public void Get_ReturnsBadRequest_OnTakeGreaterThan50()
    {
        var result = controller.Get(take: 51);

        Assert.IsType<BadRequestObjectResult>(result);
        matchHistoryRepository.DidNotReceive().GetPage(Arg.Any<int>(), Arg.Any<int>());
    }

    [Fact]
    public void Get_ReturnsBadRequest_OnTakeBelow1()
    {
        var result = controller.Get(take: 0);

        Assert.IsType<BadRequestObjectResult>(result);
        matchHistoryRepository.DidNotReceive().GetPage(Arg.Any<int>(), Arg.Any<int>());
    }

    [Fact]
    public void Get_PassesSkipAndTakeToRepository()
    {
        controller.Get(skip: 20, take: 5);

        matchHistoryRepository.Received(1).GetPage(20, 5);
    }
}
