namespace PoolLeaderboardEngine.Killer.GameActions;

internal class MissGameAction : BaseGameAction
{
    /// <summary>
    /// The index in the killer game of the player who this action applies to.
    /// </summary>
    private int? playerIndexOfLifeTaken;
    /// <summary>
    /// Represents sudden death logic on a miss. Will be null if sudden death was not active.
    /// </summary>
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

        /// <summary>
        /// If sudden death causes different behaviour from a single life deduction.
        /// </summary>
        /// <param name="gameState">The game to check</param>
        /// <returns>True if the game should record something other than a single life deduction.</returns>
        internal static bool ChangesMissBehaviour(KillerGameState gameState)
        {
            // Misses only complicate sudden death with no pots. In standard or sudden death with pots, the player just loses a life.
            return gameState.SuddenDeathState == SuddenDeathState.ActiveWithNoPots;
        }

        /// <summary>
        /// Handle a miss for the current player in sudden death with no current pots in the round.
        /// </summary>
        /// <param name="gameState">The game to modify.</param>
        /// <param name="currentPlayer">The player who missed.</param>
        internal void HandleMiss(KillerGameState gameState, KillerGameRow currentPlayer)
        {
            currentPlayer.MissedInSuddenDeath = true;

            // Check if we are the last alive player. If we are, all players have missed and a new round should start.
            IEnumerable<KillerGameRow> playersLaterInRound = gameState.PlayerRows.Skip(gameState.CurrentPlayerIndex + 1);
            bool anyOtherPlayersToShoot = playersLaterInRound.Any(p => p.LivesRemaining > 0);
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