using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardRepository leaderboardRepository;
        private readonly IHubContext<LeaderboardHub> hubContext;

        public LeaderboardController(ILeaderboardRepository leaderboardRepository, IHubContext<LeaderboardHub> hubContext)
        {
            this.leaderboardRepository = leaderboardRepository;
            this.hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AddParticipantBody request)
        {
            if (leaderboardRepository.ExistsByName(request.Name))
                return Conflict($"A participant named '{request.Name}' already exists.");

            leaderboardRepository.Add(request.Name);

            var entries = leaderboardRepository.GetAll();
            await hubContext.Clients.All.SendAsync("ReceiveLeaderboard", entries);

            return Ok();
        }
    }

    public class AddParticipantBody
    {
        public required string Name { get; set; }
    }
}
