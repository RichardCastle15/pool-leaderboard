namespace PoolLeaderboardEngine.Killer;

/// <summary>
/// The state of a single player's row in killer.
/// </summary>
public class KillerGameRow
{
    public required string PlayerName { get; set; }
    public int LivesRemaining { get; set; }
    public bool MissedInSuddenDeath { get; set; } = false;
}