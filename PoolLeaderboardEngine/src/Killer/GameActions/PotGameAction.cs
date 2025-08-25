namespace PoolLeaderboardEngine.Killer.GameActions;

internal class PotGameAction : BaseGameAction
{
    private bool wasFirstPotInSuddenDeath;
    private IList<int> playersEliminatedInSuddenDeath = new List<int>();

    public override void Apply(KillerGameState game)
    {
        if (game.SuddenDeathState == SuddenDeathState.ActiveWithNoPots)
        {
            wasFirstPotInSuddenDeath = true;
            game.SuddenDeathState = SuddenDeathState.ActiveWithPots;
            for (int i = 0; i < game.CurrentPlayerIndex; i++)
            {
                var player = game.PlayerRows[i];
                if (player.MissedInSuddenDeath)
                {
                    player.LivesRemaining = 0;
                    playersEliminatedInSuddenDeath.Add(i);
                }
            }
        }
        base.Apply(game);
    }

    public override void Undo(KillerGameState game)
    {
        base.Undo(game);
    }
}