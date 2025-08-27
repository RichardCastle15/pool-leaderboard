namespace PoolLeaderboardEngine.Killer;

/// <summary>
/// The state of a killer game. To be modified by other classes.
/// </summary>
public class KillerGameState
{
    public int CurrentPlayerIndex { get; set; }
    public required IList<KillerGameRow> PlayerRows { get; set; }
    internal SuddenDeathState SuddenDeathState { get; set; }
}