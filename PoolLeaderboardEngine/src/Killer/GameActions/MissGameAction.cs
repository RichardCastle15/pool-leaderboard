namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    private int? playerIndexOfLifeTaken;

    public override void Apply(KillerGameState gameState)
    {
        playerIndexOfLifeTaken = gameState.CurrentPlayerIndex;
        --gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining;
        MoveToNextAlive(gameState);
    }

    public override void Undo(KillerGameState gameState)
    {
        if (!playerIndexOfLifeTaken.HasValue)
            throw new Exception("Cannot undo this action as it has not been performed.");
        ++gameState.PlayerRows[playerIndexOfLifeTaken.Value].LivesRemaining;
        MoveToPreviousAlive(gameState);
    }
}