namespace PoolLeaderboardEngine.Killer;

public class KillerGame
{
    private KillerGameState gameState;

    public KillerGame(IEnumerable<string> players)
    {
        this.gameState = new KillerGameState
        {
            PlayerRows = players.Select(p => new KillerGameRow { PlayerName = p, LivesRemaining = 3, MissedInSuddenDeath = false }).ToList(),
            CurrentPlayerIndex = 0
        };
    }

    public KillerGameState GetState()
    {
        return this.gameState;
    }

    public void Pot()
    {
        this.moveToNext();
    }

    public void Miss()
    {
        --this.gameState.PlayerRows[this.gameState.CurrentPlayerIndex].LivesRemaining;
        this.moveToNext();
    }

    private void moveToNext()
    {
        gameState.CurrentPlayerIndex = (gameState.CurrentPlayerIndex + 1) % gameState.PlayerRows.Count;
    }
}