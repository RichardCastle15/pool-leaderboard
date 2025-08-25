namespace PoolLeaderboardEngine.Killer.GameActions;

internal abstract class BaseGameAction : IGameAction
{
    private bool causedSuddenDeath;

    public virtual void Apply(KillerGameState gameState)
    {
        MoveToNextAlive(gameState);
    }
    public virtual void Undo(KillerGameState gameState)
    {
        if (causedSuddenDeath)
            gameState.SuddenDeathState = SuddenDeathState.NotActive;
        MoveToPreviousAlive(gameState);
    }

    protected void MoveToNextAlive(KillerGameState game)
    {
        do
        {
            // Move to next player, wrapping to first if needed.
            game.CurrentPlayerIndex = (game.CurrentPlayerIndex + 1) % game.PlayerRows.Count;

            // Check if the player index moving caused sudden death.
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

    protected void MoveToPreviousAlive(KillerGameState game)
    {
        do
        {
            if (game.CurrentPlayerIndex == 0)
                game.CurrentPlayerIndex = game.PlayerRows.Count - 1;
            else
                game.CurrentPlayerIndex = game.CurrentPlayerIndex - 1;
        } while (game.PlayerRows[game.CurrentPlayerIndex].LivesRemaining == 0);
    }
}