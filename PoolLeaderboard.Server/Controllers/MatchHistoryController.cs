using Microsoft.AspNetCore.Mvc;
using PoolLeaderboardEngine.MatchHistory;

namespace PoolLeaderboard.Server.Controllers;

[Route("api/match-history")]
[ApiController]
public class MatchHistoryController(IMatchHistoryRepository matchHistoryRepository) : ControllerBase
{
    private const int MaxTake = 50;

    [HttpGet]
    public IActionResult Get([FromQuery] int skip = 0, [FromQuery] int take = 10)
    {
        if (skip < 0)
            return BadRequest("skip must be >= 0.");
        if (take < 1 || take > MaxTake)
            return BadRequest($"take must be between 1 and {MaxTake}.");

        return Ok(matchHistoryRepository.GetPage(skip, take));
    }
}
