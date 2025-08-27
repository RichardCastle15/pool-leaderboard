namespace PoolLeaderboardEngine.Killer.GameActions;

/// <summary>
/// Common behaviour shared between game actions, e.g. all actions move to the next player.
/// </summary>
internal abstract class BaseGameAction : IGameAction
{
    /// <summary>
    /// Sudden death is triggered when this action is the last of a round and the next round has all remaining players with 1 life.
    /// True = applying this action triggered sudden death.
    /// </summary>
    private bool causedSuddenDeath;

    /// <summary>
    /// Common behaviours on apply, like moving to the next alive player.
    /// </summary>
    /// <param name="gameState"></param>
    public virtual void Apply(KillerGameState gameState)
    {
        MoveToNextAlive(gameState);
    }

    /// <summary>
    /// Undos the common behaviours done in <see cref="Apply"/>.
    /// </summary>
    /// <param name="gameState"></param>
    public virtual void Undo(KillerGameState gameState)
    {
        if (causedSuddenDeath)
            gameState.SuddenDeathState = SuddenDeathState.NotActive;
        MoveToPreviousAlive(gameState);
    }

    /// <summary>
    /// Moves to the next alive player, wrapping to the top if needed.
    /// </summary>
    /// <param name="game"></param>
    protected void MoveToNextAlive(KillerGameState game)
    {
        // Move to next player, and keep moving until the current player has remaining lives.
        do
        {
            // Move to next player, wrapping to first if needed.
            game.CurrentPlayerIndex = (game.CurrentPlayerIndex + 1) % game.PlayerRows.Count;

            // Check if the player index moving triggered sudden death.
            if (game.SuddenDeathState == SuddenDeathState.NotActive && game.CurrentPlayerIndex == 0 && remainingPlayersOnOneLife(game))
            {
                game.SuddenDeathState = SuddenDeathState.ActiveWithNoPots;
                causedSuddenDeath = true;
            }
        } while (game.PlayerRows[game.CurrentPlayerIndex].LivesRemaining == 0);
    }

    private bool remainingPlayersOnOneLife(KillerGameState gameState)
    {
        return gameState.PlayerRows.All(pr => pr.LivesRemaining < 2);
    }

    /// <summary>
    /// Modifies the supplied game so the current player is the first preceding player with at least 1 life.
    /// </summary>
    /// <param name="game">Game state to modify.</param>
    protected void MoveToPreviousAlive(KillerGameState game)
    {
        do
        {
            // If we're the first player, wrap to the last player. Else, move 1 back.
            if (game.CurrentPlayerIndex == 0)
                game.CurrentPlayerIndex = game.PlayerRows.Count - 1;
            else
                game.CurrentPlayerIndex = game.CurrentPlayerIndex - 1;
        } while (game.PlayerRows[game.CurrentPlayerIndex].LivesRemaining == 0);
    }
}