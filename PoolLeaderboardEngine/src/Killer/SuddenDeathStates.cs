namespace PoolLeaderboardEngine.Killer;

internal enum SuddenDeathState
{
    /// <summary>
    /// Not in sudden death.
    /// </summary>
    NotActive,
    /// <summary>
    /// In sudden death but no one has potted yet.
    /// </summary>
    ActiveWithNoPots,
    /// <summary>
    /// In sudden death and someone has potted.
    /// </summary>
    ActiveWithPots
}