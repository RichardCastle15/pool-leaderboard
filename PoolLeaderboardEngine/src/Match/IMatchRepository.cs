namespace PoolLeaderboardEngine.Match;

public interface IMatchRepository
{
    void Add(int winnerId, int loserId, int winnerDelta, int loserDelta);
}
