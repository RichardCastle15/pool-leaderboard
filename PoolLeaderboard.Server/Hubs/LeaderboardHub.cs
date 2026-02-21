using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Controllers;
using PoolLeaderboard.Server.Data;

namespace PoolLeaderboard.Server.Hubs
{
    public class LeaderboardHub : Hub
    {
        private readonly IDbConnectionFactory dbConnectionFactory;

        public LeaderboardHub(IDbConnectionFactory dbConnectionFactory)
        {
            this.dbConnectionFactory = dbConnectionFactory;
        }

        public override async Task OnConnectedAsync()
        {
            var entries = ReadLeaderboard();
            await Clients.Caller.SendAsync("ReceiveLeaderboard", entries);
            await base.OnConnectedAsync();
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
}
