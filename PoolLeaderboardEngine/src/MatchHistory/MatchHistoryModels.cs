namespace PoolLeaderboardEngine.MatchHistory;

public static class MatchHistoryEntryType
{
    public const string OneVsOne = "OneVsOne";
    public const string Killer = "Killer";
}

public class MatchHistoryPlayer
{
    public int Id { get; set; }
    public required string Name { get; set; }
}

public class MatchHistoryKillerPlayer
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int Delta { get; set; }
    public bool IsWinner { get; set; }
}

public class MatchHistoryEntry
{
    public required string Type { get; set; }
    public DateTime PlayedAt { get; set; }
    public MatchHistoryPlayer? Winner { get; set; }
    public MatchHistoryPlayer? Loser { get; set; }
    public int Delta { get; set; }
    public List<MatchHistoryKillerPlayer>? Players { get; set; }
}

public class MatchHistoryPage
{
    public int Total { get; set; }
    public required List<MatchHistoryEntry> Items { get; set; }
}
