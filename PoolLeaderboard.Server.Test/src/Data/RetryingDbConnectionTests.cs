using System.Data;
using System.Net.Sockets;
using Npgsql;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using PoolLeaderboard.Server.Data;

namespace PoolLeaderboard.Server.Test.Data;

public class RetryingDbConnectionTests
{
    private static readonly TimeSpan[] Delays =
    [
        TimeSpan.FromMilliseconds(100),
        TimeSpan.FromMilliseconds(200),
        TimeSpan.FromMilliseconds(400),
    ];

    private readonly IDbConnection inner = Substitute.For<IDbConnection>();
    private readonly IDbCommand ping = Substitute.For<IDbCommand>();
    private readonly List<TimeSpan> sleeps = [];
    private int poolClears;

    public RetryingDbConnectionTests()
    {
        inner.CreateCommand().Returns(ping);
    }

    private RetryingDbConnection MakeConnection() => new(inner, Delays, sleeps.Add, _ => poolClears++);

    private static PostgresException DatabaseStartingUp() =>
        new("the database system is starting up", "FATAL", "FATAL", PostgresErrorCodes.CannotConnectNow);

    private static PostgresException ConnectionTerminated() =>
        new("terminating connection due to administrator command", "FATAL", "FATAL", PostgresErrorCodes.AdminShutdown);

    private static Action<NSubstitute.Core.CallInfo> FailTimes(int failures, Func<Exception> makeException)
    {
        var calls = 0;
        return _ =>
        {
            if (calls++ < failures)
            {
                throw makeException();
            }
        };
    }

    [Fact]
    public void Open_DoesNotRetry_WhenFirstAttemptSucceeds()
    {
        MakeConnection().Open();

        inner.Received(1).Open();
        ping.Received(1).ExecuteScalar();
        Assert.Empty(sleeps);
        Assert.Equal(0, poolClears);
    }

    [Fact]
    public void Open_RetriesWithBackoff_WhenDatabaseIsStartingUp()
    {
        inner.When(c => c.Open()).Do(FailTimes(2, DatabaseStartingUp));

        MakeConnection().Open();

        inner.Received(3).Open();
        Assert.Equal([Delays[0], Delays[1]], sleeps);
    }

    [Fact]
    public void Open_Retries_WhenConnectionIsRefused()
    {
        inner.When(c => c.Open()).Do(FailTimes(1,
            () => new NpgsqlException("Failed to connect", new SocketException((int)SocketError.ConnectionRefused))));

        MakeConnection().Open();

        inner.Received(2).Open();
    }

    [Fact]
    public void Open_ClearsPoolAndRetries_WhenPooledConnectionIsDead()
    {
        ping.When(c => c.ExecuteScalar()).Do(FailTimes(1, ConnectionTerminated));

        MakeConnection().Open();

        inner.Received(2).Open();
        inner.Received(1).Close();
        Assert.Equal(1, poolClears);
    }

    [Fact]
    public void Open_DoesNotRetry_NonTransientError()
    {
        var authFailure = new PostgresException("password authentication failed", "FATAL", "FATAL", PostgresErrorCodes.InvalidPassword);
        inner.When(c => c.Open()).Throw(authFailure);

        var thrown = Assert.Throws<PostgresException>(() => MakeConnection().Open());

        Assert.Same(authFailure, thrown);
        inner.Received(1).Open();
        Assert.Empty(sleeps);
    }

    [Fact]
    public void Open_RethrowsLastError_WhenAttemptsAreExhausted()
    {
        inner.When(c => c.Open()).Throw(_ => DatabaseStartingUp());

        var thrown = Assert.Throws<PostgresException>(() => MakeConnection().Open());

        Assert.Equal(PostgresErrorCodes.CannotConnectNow, thrown.SqlState);
        inner.Received(Delays.Length + 1).Open();
        Assert.Equal(Delays, sleeps);
    }

    [Fact]
    public void CreateCommand_DelegatesToInnerConnection()
    {
        Assert.Same(ping, MakeConnection().CreateCommand());
    }

    [Fact]
    public void BeginTransaction_DelegatesToInnerConnection()
    {
        var transaction = Substitute.For<IDbTransaction>();
        inner.BeginTransaction().Returns(transaction);

        Assert.Same(transaction, MakeConnection().BeginTransaction());
    }

    [Fact]
    public void Dispose_DisposesInnerConnection()
    {
        MakeConnection().Dispose();

        inner.Received(1).Dispose();
    }
}
