namespace PoolLeaderboardEngine.Killer.GameActions;

internal class PotGameAction : BaseGameAction
{
    public override void Apply(KillerGameState game)
    {
        MoveToNextAlive(game);
    }

    public override void Undo(KillerGameState game)
    {
        MoveToPreviousAlive(game);
    }
}