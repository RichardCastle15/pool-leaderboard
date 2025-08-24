namespace PoolLeaderboardEngine.Killer.GameActions;

internal class PotBlackBallEarlyGameAction : BaseGameAction
{
    private int? playerIndex;
    private int? livesTaken;

    public override void Apply(KillerGameState gameState)
    {
        playerIndex = gameState.CurrentPlayerIndex;
        livesTaken = gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining;
        gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining = 0;
        base.Apply(gameState);
    }

    public override void Undo(KillerGameState gameState)
    {
        if (!playerIndex.HasValue || !livesTaken.HasValue)
            throw new Exception("Cannot undo action which has not been applied.");

        gameState.PlayerRows[playerIndex.Value].LivesRemaining = livesTaken.Value;
        base.Undo(gameState);
    }
}