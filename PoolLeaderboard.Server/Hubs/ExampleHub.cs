using Microsoft.AspNetCore.SignalR;

namespace PoolLeaderboard.Server.Hubs
{
    public class ExampleHub : Hub
    {
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
