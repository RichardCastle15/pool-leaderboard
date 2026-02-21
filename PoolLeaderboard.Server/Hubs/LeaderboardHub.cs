using Microsoft.AspNetCore.SignalR;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Hubs
{
    public class LeaderboardHub : Hub
    {
        private readonly ILeaderboardRepository leaderboardRepository;

        public LeaderboardHub(ILeaderboardRepository leaderboardRepository)
        {
            this.leaderboardRepository = leaderboardRepository;
        }

        public override async Task OnConnectedAsync()
        {
            var entries = leaderboardRepository.GetAll();
            await Clients.Caller.SendAsync("ReceiveLeaderboard", entries);
            await base.OnConnectedAsync();
        }
    }
}
