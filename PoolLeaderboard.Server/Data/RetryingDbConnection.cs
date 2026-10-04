using System.Data;
using System.Diagnostics.CodeAnalysis;
using Npgsql;

namespace PoolLeaderboard.Server.Data
{
    /// <summary>
    /// Wraps a connection so that <see cref="Open"/> retries with backoff on transient errors.
    /// Railway sleeps the database when idle, which bites in two ways:
    ///  - while it wakes, opening fails with 57P03 ("the database system is starting up") or connection refused;
    ///  - pooled connections from before it slept are dead, but the pool still hands them out from Open().
    /// Open() therefore pings the connection and, on a transient failure, clears the pool and tries again.
    /// Only opening is retried - commands are never re-run, so writes such as Elo updates can't be applied twice.
    /// Everything else delegates to the inner connection.
    /// </summary>
    public class RetryingDbConnection : IDbConnection
    {
        // Delays between attempts: ~11.5s of waiting in total across 6 attempts.
        public static readonly TimeSpan[] DefaultRetryDelays =
        [
            TimeSpan.FromMilliseconds(500),
            TimeSpan.FromSeconds(1),
            TimeSpan.FromSeconds(2),
            TimeSpan.FromSeconds(4),
            TimeSpan.FromSeconds(4),
        ];

        private readonly IDbConnection _inner;
        private readonly IReadOnlyList<TimeSpan> _retryDelays;
        private readonly Action<TimeSpan> _sleep;
        private readonly Action<IDbConnection> _clearPool;
        private readonly ILogger? _logger;

        public RetryingDbConnection(NpgsqlConnection inner, ILogger? logger = null)
            : this(inner, DefaultRetryDelays, Thread.Sleep, c => NpgsqlConnection.ClearPool((NpgsqlConnection)c), logger)
        {
        }

        public RetryingDbConnection(
            IDbConnection inner,
            IReadOnlyList<TimeSpan> retryDelays,
            Action<TimeSpan> sleep,
            Action<IDbConnection> clearPool,
            ILogger? logger = null)
        {
            _inner = inner;
            _retryDelays = retryDelays;
            _sleep = sleep;
            _clearPool = clearPool;
            _logger = logger;
        }

        public static bool IsTransient(Exception ex) =>
            // Npgsql flags 57P03/57P01/08xxx etc. as transient, as well as socket/IO/timeout failures.
            ex is NpgsqlException { IsTransient: true };

        public void Open()
        {
            for (var attempt = 0; ; attempt++)
            {
                try
                {
                    _inner.Open();
                    Ping();
                    return;
                }
                catch (Exception ex) when (attempt < _retryDelays.Count && IsTransient(ex))
                {
                    var delay = _retryDelays[attempt];
                    _logger?.LogWarning(ex, "Transient error opening database connection (attempt {Attempt}); retrying in {Delay}ms.",
                        attempt + 1, delay.TotalMilliseconds);
                    _inner.Close();
                    // Other idle connections in the pool are probably just as dead as this one.
                    _clearPool(_inner);
                    _sleep(delay);
                }
            }
        }

        private void Ping()
        {
            using var command = _inner.CreateCommand();
            command.CommandText = "SELECT 1";
            command.ExecuteScalar();
        }

        [AllowNull]
        public string ConnectionString
        {
            get => _inner.ConnectionString;
            set => _inner.ConnectionString = value;
        }

        public int ConnectionTimeout => _inner.ConnectionTimeout;

        public string Database => _inner.Database;

        public ConnectionState State => _inner.State;

        public IDbTransaction BeginTransaction() => _inner.BeginTransaction();

        public IDbTransaction BeginTransaction(IsolationLevel il) => _inner.BeginTransaction(il);

        public void ChangeDatabase(string databaseName) => _inner.ChangeDatabase(databaseName);

        public void Close() => _inner.Close();

        public IDbCommand CreateCommand() => _inner.CreateCommand();

        public void Dispose() => _inner.Dispose();
    }
}
