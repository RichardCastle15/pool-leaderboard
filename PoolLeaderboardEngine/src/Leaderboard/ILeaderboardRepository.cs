namespace PoolLeaderboardEngine.Leaderboard
{
    public interface ILeaderboardRepository
    {
        List<LeaderboardEntry> GetAll();
        void Add(string name);
    }
}
