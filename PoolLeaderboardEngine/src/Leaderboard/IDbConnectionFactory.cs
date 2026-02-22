using System.Data;

namespace PoolLeaderboardEngine.Leaderboard
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
