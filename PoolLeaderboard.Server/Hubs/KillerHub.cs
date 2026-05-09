using Microsoft.AspNetCore.SignalR;
using PoolLeaderboard.Server.Services;

namespace PoolLeaderboard.Server.Hubs;

public class KillerHub(KillerGameService killerGameService, ILogger<KillerHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("ReceiveKillerGame", killerGameService.GetStateDto());
        await base.OnConnectedAsync();
    }

    public async Task Pot() => await ExecuteAction(() => killerGameService.Pot());
    public async Task Miss() => await ExecuteAction(() => killerGameService.Miss());
    public async Task EarlyBlackPot() => await ExecuteAction(() => killerGameService.EarlyBlackPot());
    public async Task Undo() => await ExecuteAction(() => killerGameService.Undo());

    public async Task Abandon()
    {
        killerGameService.EndGame();
        await Clients.All.SendAsync("KillerGameEnded");
    }

    private async Task ExecuteAction(Action action)
    {
        try
        {
            action();
            await Clients.All.SendAsync("ReceiveKillerGame", killerGameService.GetStateDto());
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Game action failed for connection {ConnectionId}", Context.ConnectionId);
            await Clients.Caller.SendAsync("KillerError", ex.Message);
        }
    }
}
