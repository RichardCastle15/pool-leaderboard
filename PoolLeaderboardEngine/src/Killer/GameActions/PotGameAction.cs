namespace PoolLeaderboardEngine.Killer.GameActions;

internal class PotGameAction : BaseGameAction
{
    private bool wasFirstPotInSuddenDeath;
    private IList<int> playersEliminatedInSuddenDeath = [];

    public override void Apply(KillerGameState game)
    {
        if (game.SuddenDeathState == SuddenDeathState.ActiveWithNoPots)
        {
            handleFirstPotInSuddenDeath(game);
        }
        base.Apply(game);
    }

    private void handleFirstPotInSuddenDeath(KillerGameState game)
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

    public override void Undo(KillerGameState game)
    {
        if (wasFirstPotInSuddenDeath)
        {
            game.SuddenDeathState = SuddenDeathState.ActiveWithNoPots;
            foreach (int i in playersEliminatedInSuddenDeath)
            {
                game.PlayerRows[i].LivesRemaining = 1;
            }
        }
        base.Undo(game);
    }
}