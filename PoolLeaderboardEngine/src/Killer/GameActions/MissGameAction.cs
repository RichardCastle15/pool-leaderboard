namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    private int? playerIndexOfLifeTaken;
    private bool markedInSuddenDeath;

    public override void Apply(KillerGameState gameState)
    {
        playerIndexOfLifeTaken = gameState.CurrentPlayerIndex;
        var player = gameState.PlayerRows[gameState.CurrentPlayerIndex];
        if (gameState.InSuddenDeath && player.LivesRemaining == 1)
        {
            markedInSuddenDeath = true;
            player.MissedInSuddenDeath = true;
        }
        else
        {
            --player.LivesRemaining;
        }
        base.Apply(gameState);
    }

    public override void Undo(KillerGameState gameState)
    {
        if (!playerIndexOfLifeTaken.HasValue)
            throw new Exception("Cannot undo this action as it has not been performed.");
        var player = gameState.PlayerRows[playerIndexOfLifeTaken.Value];
        if (markedInSuddenDeath)
            player.MissedInSuddenDeath = false;
        else
            ++player.LivesRemaining;
        base.Undo(gameState);
    }
}