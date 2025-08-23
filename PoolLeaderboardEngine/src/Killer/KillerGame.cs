namespace PoolLeaderboardEngine.Killer;

public class KillerGame
{
    private KillerGameState gameState;

    public KillerGame(IEnumerable<string> players)
    {
        this.gameState = new KillerGameState
        {
            PlayerRows = players.Select(p => new KillerGameRow { PlayerName = p, LivesRemaining = 3, MissedInSuddenDeath = false }).ToList()
        };
    }

    public KillerGameState GetState()
    {
        return this.gameState;
    }
}