using Microsoft.AspNetCore.Mvc;
using PoolLeaderboard.Server.Data;

namespace PoolLeaderboard.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly IDbConnectionFactory dbConnectionFactory;

        public LeaderboardController(IDbConnectionFactory dbConnectionFactory)
        {
            this.dbConnectionFactory = dbConnectionFactory;
        }

        /// <summary>
        /// Sample HTTP GET with database access.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public List<LeaderboardEntry> Get()
        {
            var leaderboardEntries = new List<LeaderboardEntry>();
            using (var connection = this.dbConnectionFactory.CreateConnection())
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "select * from rating";
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string name = (string)reader["name"];
                            short rating = (short)reader["rating"];
                            int id = (int)reader["id"];
                            leaderboardEntries.Add(new LeaderboardEntry { Name = name, Rating = rating, Id = id });
                        }
                    }
                }
            }
            return leaderboardEntries;
        }

        [HttpPost]
        public IActionResult  AddNewParticipant(string name)
        {
            using (var connection = this.dbConnectionFactory.CreateConnection())
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"insert into rating (name, rating) values ('{name}', 1000)";
                    command.ExecuteNonQuery();
                }
            }
            return Ok();
        }
    }

    public class LeaderboardEntry
    {
        public required string Name { get; set; }
        public short Rating { get; set; }
        public int Id { get; set; }
    }
}
