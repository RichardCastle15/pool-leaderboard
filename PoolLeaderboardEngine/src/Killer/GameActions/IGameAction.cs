namespace PoolLeaderboardEngine.Killer.GameActions;

/// <summary>
/// An action which can be performed on a game of killer, e.g. a player pots or misses.
/// </summary>
internal interface IGameAction
{
    /// <summary>
    /// Modifies the supplied game state to reflact the action.
    /// </summary>
    /// <param name="toGame">Game state to modify</param>
    void Apply(KillerGameState toGame);

    /// <summary>
    /// Undos the state modification done via the <see cref="Apply(KillerGameState)"/> method.
    /// </summary>
    /// <param name="toGame">The game to undo the modification.</param>
    void Undo(KillerGameState toGame);
}