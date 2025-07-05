using System.Data;

namespace PoolLeaderboard.Server.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}