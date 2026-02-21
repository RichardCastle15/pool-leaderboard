using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Data;
using PoolLeaderboard.Server.Hubs;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardRepository leaderboardRepository;
        private readonly IDbConnectionFactory dbConnectionFactory;
        private readonly IHubContext<LeaderboardHub> hubContext;

        public LeaderboardController(ILeaderboardRepository leaderboardRepository, IDbConnectionFactory dbConnectionFactory, IHubContext<LeaderboardHub> hubContext)
        {
            this.leaderboardRepository = leaderboardRepository;
            this.dbConnectionFactory = dbConnectionFactory;
            this.hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AddParticipantBody request)
        {
            using (var connection = this.dbConnectionFactory.CreateConnection())
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"insert into rating (name, rating) values ('{request.Name}', 1000)";
                    command.ExecuteNonQuery();
                }
            }

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
