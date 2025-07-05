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
        public IEnumerable<LeaderboardEntry> Get()
        {
            var connection = this.dbConnectionFactory.CreateConnection();
            connection.Open();
            var command = connection.CreateCommand();
            command.CommandText = "select * from Ratings";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                string name = (string)reader["Name"];
                short rating = (short)reader["Rating"];
                yield return new LeaderboardEntry { Name = name, Rating = rating };
            }
        }
    }

    public class LeaderboardEntry
    {
        public required string Name { get; set; }
        public short Rating { get; set; }
    }
}
