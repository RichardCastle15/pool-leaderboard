using Microsoft.AspNetCore.Mvc;
using PoolLeaderboardEngine.MatchHistory;
using PoolLeaderboardEngine.Player;

namespace PoolLeaderboard.Server.Controllers;

[Route("api/players")]
[ApiController]
public class PlayerController(
    IMatchHistoryRepository matchHistoryRepository,
    IHeadToHeadRepository headToHeadRepository) : ControllerBase
{
    private const int MaxTake = 50;

    [HttpGet("{id}/matches")]
    public IActionResult GetMatches(int id, [FromQuery] int skip = 0, [FromQuery] int take = 10)
    {
        if (skip < 0)
            return BadRequest("skip must be >= 0.");
        if (take < 1 || take > MaxTake)
            return BadRequest($"take must be between 1 and {MaxTake}.");

        return Ok(matchHistoryRepository.GetPlayerPage(id, skip, take));
    }

    [HttpGet("{id}/head-to-head")]
    public IActionResult GetHeadToHead(int id)
    {
        return Ok(headToHeadRepository.GetRecords(id));
    }
}
