using Microsoft.AspNetCore.SignalR;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Hubs
{
    public class LeaderboardHub(ILeaderboardRepository leaderboardRepository, ILogger<LeaderboardHub> logger) : Hub
    {
        public override async Task OnConnectedAsync()
        {
            try
            {
                var entries = leaderboardRepository.GetAll();
                await Clients.Caller.SendAsync("ReceiveLeaderboard", entries);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch leaderboard entries for connection {ConnectionId}", Context.ConnectionId);
                await Clients.Caller.SendAsync("LeaderboardError", "Failed to load leaderboard data.");
            }

            await base.OnConnectedAsync();
        }
    }
}
