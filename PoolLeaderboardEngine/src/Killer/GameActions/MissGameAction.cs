namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    private int? playerIndexOfLifeTaken;
    private bool markedInSuddenDeath;

    public override void Apply(KillerGameState gameState)
    {
        playerIndexOfLifeTaken = gameState.CurrentPlayerIndex;
        var player = gameState.PlayerRows[gameState.CurrentPlayerIndex];

        if (gameState.SuddenDeathState == SuddenDeathState.ActiveWithNoPots)
        {
            var playersLaterInRound = gameState.PlayerRows.Skip(gameState.CurrentPlayerIndex + 1);
            var anyOtherPlayersToShoot = playersLaterInRound.Any(p => p.LivesRemaining > 0);

            if (anyOtherPlayersToShoot)
            {
                markedInSuddenDeath = true;
                player.MissedInSuddenDeath = true;
            }
            else
            {
                // Restore all players who have missed this round.
                var playersWhoMissed = gameState.PlayerRows.Where(p => p.MissedInSuddenDeath);
                foreach (var missedPlayer in playersWhoMissed)
                {
                    missedPlayer.MissedInSuddenDeath = false;
                }
            }
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