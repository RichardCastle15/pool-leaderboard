namespace PoolLeaderboardEngine.MatchHistory;

public interface IMatchHistoryRepository
{
    MatchHistoryPage GetPage(int skip, int take);
}
