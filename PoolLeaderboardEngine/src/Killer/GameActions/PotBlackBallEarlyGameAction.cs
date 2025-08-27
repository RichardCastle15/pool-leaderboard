namespace PoolLeaderboardEngine.Killer.GameActions;

/// <summary>
/// A player is immediately eliminated if they pot the black ball early.
/// </summary>
internal class PotBlackBallEarlyGameAction : BaseGameAction
{
    /// <summary>
    /// The index of the player who potted the black early.
    /// Field is null if action was not applied yet.
    /// </summary>
    private int? playerIndex;
    /// <summary>
    /// How many lives they had when they missed. Recorded so can be undone if needed.
    /// Field is null if action was not applied yet.
    /// </summary>
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