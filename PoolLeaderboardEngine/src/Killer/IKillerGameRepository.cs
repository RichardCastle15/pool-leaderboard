namespace PoolLeaderboardEngine.Killer;

public interface IKillerGameRepository
{
    void Add(IReadOnlyList<KillerGamePlayerRecord> players);
}

public record KillerGamePlayerRecord(int PlayerId, int Delta, bool IsWinner);
