namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    private int? playerIndexOfLifeTaken;
    private SuddenDeath? suddenDeath;

    public override void Apply(KillerGameState gameState)
    {
        playerIndexOfLifeTaken = gameState.CurrentPlayerIndex;
        KillerGameRow _currentPlayer = gameState.PlayerRows[gameState.CurrentPlayerIndex];

        if (SuddenDeath.ChangesMissBehaviour(gameState))
        {
            suddenDeath = new();
            suddenDeath.HandleMiss(gameState, _currentPlayer);
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
        KillerGameRow player = gameState.PlayerRows[playerIndexOfLifeTaken.Value];
        if (suddenDeath != null)
            suddenDeath.Undo(gameState, player);
        else
            ++player.LivesRemaining;

        base.Undo(gameState);
    }

    /// <summary>
    /// The act of missing in sudden death.
    /// </summary>
    private class SuddenDeath
    {
        /// <summary>
        /// If all players miss in a round, they move to next round with a fresh life.
        /// Record these players if undo needed.
        /// </summary>
        private readonly IList<int> playersWhoWereRestoredByMiss = [];

        internal static bool ChangesMissBehaviour(KillerGameState gameState)
        {
            return gameState.SuddenDeathState == SuddenDeathState.ActiveWithNoPots;
        }

        internal void HandleMiss(KillerGameState gameState, KillerGameRow currentPlayer)
        {
            IEnumerable<KillerGameRow> playersLaterInRound = gameState.PlayerRows.Skip(gameState.CurrentPlayerIndex + 1);
            bool anyOtherPlayersToShoot = playersLaterInRound.Any(p => p.LivesRemaining > 0);

            currentPlayer.MissedInSuddenDeath = true;
            if (!anyOtherPlayersToShoot)
            {
                handleAllPlayersMissedInSuddenDeath(gameState);
            }
        }

        private void handleAllPlayersMissedInSuddenDeath(KillerGameState gameState)
        {
            // Restore all players who have missed this round.
            for (int i = 0; i < gameState.PlayerRows.Count; i++)
            {
                KillerGameRow _playerToRestore = gameState.PlayerRows[i];
                if (_playerToRestore.MissedInSuddenDeath)
                {
                    _playerToRestore.MissedInSuddenDeath = false;
                    playersWhoWereRestoredByMiss.Add(i);
                }
            }
        }

        internal void Undo(KillerGameState gameState, KillerGameRow player)
        {
            player.MissedInSuddenDeath = false;
            foreach (int pidx in playersWhoWereRestoredByMiss)
            {
                // Only put people as missed who aren't the person taking the next shot.
                if (gameState.PlayerRows[pidx] != player)
                    gameState.PlayerRows[pidx].MissedInSuddenDeath = true;
            }
        }
    }
}