namespace PoolLeaderboardEngine.Player;

public class HeadToHeadRecord
{
    public int OpponentId { get; set; }
    public required string OpponentName { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int PointsWon { get; set; }
    public int PointsLost { get; set; }
}
