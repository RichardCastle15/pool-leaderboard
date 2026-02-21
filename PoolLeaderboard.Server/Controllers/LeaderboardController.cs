using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Data;
using PoolLeaderboard.Server.Hubs;

namespace PoolLeaderboard.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly IDbConnectionFactory dbConnectionFactory;
        private readonly IHubContext<LeaderboardHub> hubContext;

        public LeaderboardController(IDbConnectionFactory dbConnectionFactory, IHubContext<LeaderboardHub> hubContext)
        {
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

            var entries = ReadLeaderboard();
            await hubContext.Clients.All.SendAsync("ReceiveLeaderboard", entries);

            return Ok();
        }

        private List<LeaderboardEntry> ReadLeaderboard()
        {
            var entries = new List<LeaderboardEntry>();
            using var connection = dbConnectionFactory.CreateConnection();
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = "select * from rating";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                entries.Add(new LeaderboardEntry
                {
                    Name = (string)reader["name"],
                    Rating = (short)reader["rating"],
                    Id = (int)reader["id"]
                });
            }
            return entries;
        }
    }

    public class LeaderboardEntry
    {
        public required string Name { get; set; }
        public short Rating { get; set; }
        public int Id { get; set; }
    }

    public class AddParticipantBody
    {
        public required string Name { get; set; }
    }
}
