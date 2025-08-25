namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    private int? playerIndexOfLifeTaken;
    private bool markedInSuddenDeath;
    private IList<int> playersWhoWereRestoredInSuddenDeath = [];

    public override void Apply(KillerGameState gameState)
    {
        playerIndexOfLifeTaken = gameState.CurrentPlayerIndex;
        var _currentPlayer = gameState.PlayerRows[gameState.CurrentPlayerIndex];

        if (gameState.SuddenDeathState == SuddenDeathState.ActiveWithNoPots)
        {
            var playersLaterInRound = gameState.PlayerRows.Skip(gameState.CurrentPlayerIndex + 1);
            var anyOtherPlayersToShoot = playersLaterInRound.Any(p => p.LivesRemaining > 0);

            markedInSuddenDeath = true;
            _currentPlayer.MissedInSuddenDeath = true;
            if (!anyOtherPlayersToShoot)
            {
                // Restore all players who have missed this round.
                for (int i = 0; i < gameState.PlayerRows.Count; i++)
                {
                    var _playerToRestore = gameState.PlayerRows[i];
                    if (_playerToRestore.MissedInSuddenDeath)
                    {
                        _playerToRestore.MissedInSuddenDeath = false;
                        playersWhoWereRestoredInSuddenDeath.Add(i);
                    }
                }
            }
        }
        else
        {
            --_currentPlayer.LivesRemaining;
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

        foreach (var pidx in playersWhoWereRestoredInSuddenDeath)
        {
            // Only put people as missed who aren't the person taking the next shot.
            if (pidx != playerIndexOfLifeTaken)
                gameState.PlayerRows[pidx].MissedInSuddenDeath = true;
        }
        base.Undo(gameState);
    }
}