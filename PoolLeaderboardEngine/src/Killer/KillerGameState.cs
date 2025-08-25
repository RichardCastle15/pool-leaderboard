namespace PoolLeaderboardEngine.Killer;

public class KillerGameState
{
    public int CurrentPlayerIndex { get; set; }
    public required IList<KillerGameRow> PlayerRows { get; set; }
    internal SuddenDeathState SuddenDeathState { get; set; }
}