using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Data
{
    public class LeaderboardRepository : ILeaderboardRepository
    {
        private readonly IDbConnectionFactory dbConnectionFactory;

        public LeaderboardRepository(IDbConnectionFactory dbConnectionFactory)
        {
            this.dbConnectionFactory = dbConnectionFactory;
        }

        public void Add(string name)
        {
            using var connection = dbConnectionFactory.CreateConnection();
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = $"insert into rating (name, rating) values ('{name}', 1000)";
            command.ExecuteNonQuery();
        }

        public List<LeaderboardEntry> GetAll()
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
}
