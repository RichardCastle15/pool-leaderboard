namespace PoolLeaderboardEngine.Killer.GameActions;

/// <summary>
/// A single player has potted correctly on their turn.
/// </summary>
internal class PotGameAction : BaseGameAction
{
    /// <summary>
    /// If pot first in sudden death, changes miss behaviour for others. Record this so can be undone.
    /// </summary>
    private bool wasFirstPotInSuddenDeath;
    /// <summary>
    /// If previous players have missed, they can be eliminated by this pot. Record them so that can be undone.
    /// </summary>
    private IList<int> playersEliminatedInSuddenDeath = [];

    public override void Apply(KillerGameState game)
    {
        if (game.SuddenDeathState == SuddenDeathState.ActiveWithNoPots)
        {
            handleFirstPotInSuddenDeath(game);
        }
        base.Apply(game);
    }

    /// <summary>
    /// First pot will eliminate previous players who missed and cause future players in round to be eliminated.
    /// </summary>
    /// <param name="game"></param>
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