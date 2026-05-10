using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Elo;
using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Match;

namespace PoolLeaderboard.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MatchController(
    ILeaderboardRepository leaderboardRepository,
    IMatchRepository matchRepository,
    IHubContext<LeaderboardHub> leaderboardHubContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> RecordResult([FromBody] RecordResultRequest request)
    {
        if (request.WinnerId == request.LoserId)
            return BadRequest("Winner and loser must be different players.");

        var entries = leaderboardRepository.GetAll();
        var winner = entries.FirstOrDefault(e => e.Id == request.WinnerId);
        var loser = entries.FirstOrDefault(e => e.Id == request.LoserId);

        if (winner == null || loser == null)
            return BadRequest("Player not found.");

        var (winnerDelta, loserDelta) = EloCalculator.Compute(winner.Rating, loser.Rating);

        leaderboardRepository.UpdateRating(request.WinnerId, winnerDelta);
        leaderboardRepository.UpdateRating(request.LoserId, loserDelta);
        matchRepository.Add(request.WinnerId, request.LoserId, winnerDelta, loserDelta);

        var updatedLeaderboard = leaderboardRepository.GetAll();
        await leaderboardHubContext.Clients.All.SendAsync("ReceiveLeaderboard", updatedLeaderboard);

        return Ok(new { winnerDelta, loserDelta });
    }
}

public class RecordResultRequest
{
    public int WinnerId { get; set; }
    public int LoserId { get; set; }
}
