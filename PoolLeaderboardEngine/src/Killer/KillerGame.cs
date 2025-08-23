namespace PoolLeaderboardEngine.Killer;

public class KillerGame
{
    private KillerGameState gameState;

    public KillerGame(IEnumerable<string> _players)
    {
        gameState = new KillerGameState
        {
            PlayerRows = _players.Select(p => new KillerGameRow { PlayerName = p, LivesRemaining = 3, MissedInSuddenDeath = false }).ToList(),
            CurrentPlayerIndex = 0
        };
    }

    public KillerGameState GetState()
    {
        return gameState;
    }

    public void Pot()
    {
        moveToNext();
    }

    public void Miss()
    {
        --gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining;
        moveToNext();
    }

    public void EarlyBlackPot()
    {
        gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining = 0;
        moveToNext();
    }

    private void moveToNext()
    {
        gameState.CurrentPlayerIndex = (gameState.CurrentPlayerIndex + 1) % gameState.PlayerRows.Count;
    }
}