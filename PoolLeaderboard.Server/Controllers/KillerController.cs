using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboard.Server.Services;
using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class KillerController(
    KillerGameService killerGameService,
    IHubContext<KillerHub> killerHubContext,
    IHubContext<LeaderboardHub> leaderboardHubContext,
    ILeaderboardRepository leaderboardRepository,
    IKillerGameRepository killerGameRepository) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartGame([FromBody] StartKillerGameRequest request)
    {
        try
        {
            killerGameService.StartGame(request.Players.Select(p => (p.Id, p.Name)), request.ReplaceExisting);
        }
        catch (KillerGameInProgressException ex)
        {
            return Conflict(new KillerGameInProgressResponse(ex.Message, ex.PlayerNames, ex.Winner));
        }

        await killerHubContext.Clients.All.SendAsync("ReceiveKillerGame", killerGameService.GetStateDto());
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> ConfirmEnd()
    {
        var winner = killerGameService.GetWinnerName();
        var players = killerGameService.GetPlayers();

        if (winner == null || players == null)
            return BadRequest("No winner yet.");

        int playerCount = players.Count;
        var records = players.Select(p => new KillerGamePlayerRecord(
            p.Id,
            p.Name == winner ? 10 * (playerCount - 1) : -10,
            p.Name == winner)).ToList();

        killerGameRepository.Add(records);

        foreach (var record in records)
        {
            leaderboardRepository.UpdateRating(record.PlayerId, record.Delta);
        }

        killerGameService.EndGame();

        var updatedLeaderboard = leaderboardRepository.GetAll();
        await leaderboardHubContext.Clients.All.SendAsync("ReceiveLeaderboard", updatedLeaderboard);
        await killerHubContext.Clients.All.SendAsync("KillerGameEnded");

        return Ok();
    }
}

public class StartKillerGameRequest
{
    public required List<KillerPlayerDto> Players { get; set; }

    /// <summary>
    /// Opt in to abandoning a game that is already in progress. When false (the default) an in-progress
    /// game is left alone and the request fails with 409.
    /// </summary>
    public bool ReplaceExisting { get; set; }
}

/// <summary>Winner is set when the game is over but its result has not been confirmed yet.</summary>
public record KillerGameInProgressResponse(string Message, IReadOnlyList<string> Players, string? Winner);

public class KillerPlayerDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
}
