namespace PoolLeaderboardEngine.MatchHistory;

public interface IMatchHistoryRepository
{
    MatchHistoryPage GetPage(int skip, int take);
    MatchHistoryPage GetPlayerPage(int playerId, int skip, int take);
}
