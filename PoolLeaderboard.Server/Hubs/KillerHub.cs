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

    public async Task Pot() => await ExecuteAction(() => killerGameService.Pot(), BroadcastGameState);
    public async Task Miss() => await ExecuteAction(() => killerGameService.Miss(), BroadcastGameState);
    public async Task EarlyBlackPot() => await ExecuteAction(() => killerGameService.EarlyBlackPot(), BroadcastGameState);
    public async Task Undo() => await ExecuteAction(() => killerGameService.Undo(), BroadcastGameState);

    // Abandoning also clears the persisted game, so it can fail on a DB blip like any other
    // action and must report that to the caller rather than throwing out of the hub method.
    public async Task Abandon() => await ExecuteAction(() => killerGameService.EndGame(), BroadcastGameEnded);

    private Task BroadcastGameState() => Clients.All.SendAsync("ReceiveKillerGame", killerGameService.GetStateDto());

    private Task BroadcastGameEnded() => Clients.All.SendAsync("KillerGameEnded");

    private async Task ExecuteAction(Action action, Func<Task> broadcast)
    {
        try
        {
            action();
            await broadcast();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Game action failed for connection {ConnectionId}", Context.ConnectionId);
            await Clients.Caller.SendAsync("KillerError", ex.Message);
        }
    }
}
