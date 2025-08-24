namespace PoolLeaderboardEngine.Killer;

public class KillerGameRow
{
    public required string PlayerName { get; set; }
    public int LivesRemaining { get; set; }
    public bool MissedInSuddenDeath { get; set; } = false;
}