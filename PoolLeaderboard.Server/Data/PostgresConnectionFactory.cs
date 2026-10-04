using System.Data;
using Npgsql;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboard.Server.Data
{
    public class PostgresConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;
        private readonly ILogger<PostgresConnectionFactory> _logger;

        public PostgresConnectionFactory(IConfiguration configuration, ILogger<PostgresConnectionFactory> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentException("Connection string 'DefaultConnection' not found.");
            _logger = logger;
        }

        public IDbConnection CreateConnection()
        {
            // Railway sleeps the database when idle, so the first connection after a wake-up can
            // fail transiently - RetryingDbConnection waits it out instead of surfacing a 500.
            return new RetryingDbConnection(new NpgsqlConnection(_connectionString), _logger);
        }
    }
}
