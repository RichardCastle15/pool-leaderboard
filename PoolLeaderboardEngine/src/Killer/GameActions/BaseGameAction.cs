namespace PoolLeaderboardEngine.Killer.GameActions;

internal abstract class BaseGameAction : IGameAction
{
    public abstract void Apply(KillerGameState toGame);
    public abstract void Undo(KillerGameState toGame);

    protected void MoveToNextAlive(KillerGameState game)
    {
        do
        {
            game.CurrentPlayerIndex = (game.CurrentPlayerIndex + 1) % game.PlayerRows.Count;
        } while (game.PlayerRows[game.CurrentPlayerIndex].LivesRemaining == 0);
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