using System.Data;
using NSubstitute;
using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngineTests.Killer;

public class KillerGameRepositoryTests
{
    private readonly IDbConnectionFactory connectionFactory = Substitute.For<IDbConnectionFactory>();
    private readonly IDbConnection connection = Substitute.For<IDbConnection>();
    private readonly IDbTransaction transaction = Substitute.For<IDbTransaction>();

    public KillerGameRepositoryTests()
    {
        connectionFactory.CreateConnection().Returns(connection);
        connection.BeginTransaction().Returns(transaction);
    }

    private IDbCommand SetupCommandSequence(int killerGameId, int playerInsertCount)
    {
        // The first command inserts the parent and returns the new id via ExecuteScalar.
        var parentCommand = Substitute.For<IDbCommand>();
        var parentParams = Substitute.For<IDataParameterCollection>();
        parentCommand.Parameters.Returns(parentParams);
        parentCommand.ExecuteScalar().Returns(killerGameId);

        // Then one command per player row.
        var playerCommands = new List<IDbCommand>();
        for (int i = 0; i < playerInsertCount; i++)
        {
            var cmd = Substitute.For<IDbCommand>();
            var pars = Substitute.For<IDataParameterCollection>();
            cmd.Parameters.Returns(pars);
            cmd.CreateParameter().Returns(_ => Substitute.For<IDbDataParameter>());
            playerCommands.Add(cmd);
        }

        var allCommands = new List<IDbCommand> { parentCommand };
        allCommands.AddRange(playerCommands);
        connection.CreateCommand().Returns(allCommands[0], allCommands.Skip(1).ToArray());
        return parentCommand;
    }

    [Fact]
    public void Add_OpensConnection()
    {
        SetupCommandSequence(killerGameId: 5, playerInsertCount: 2);
        var repo = new KillerGameRepository(connectionFactory);

        repo.Add(new List<KillerGamePlayerRecord>
        {
            new(1, 10, true),
            new(2, -10, false)
        });

        connection.Received(1).Open();
    }

    [Fact]
    public void Add_BeginsAndCommitsTransaction()
    {
        SetupCommandSequence(killerGameId: 5, playerInsertCount: 1);
        var repo = new KillerGameRepository(connectionFactory);

        repo.Add(new List<KillerGamePlayerRecord> { new(1, 0, true) });

        connection.Received(1).BeginTransaction();
        transaction.Received(1).Commit();
    }

    [Fact]
    public void Add_InsertsParentRow_AndOneRowPerPlayer()
    {
        SetupCommandSequence(killerGameId: 5, playerInsertCount: 3);
        var repo = new KillerGameRepository(connectionFactory);

        repo.Add(new List<KillerGamePlayerRecord>
        {
            new(10, 20, true),
            new(11, -10, false),
            new(12, -10, false)
        });

        // 1 parent insert + 3 player inserts = 4 commands created.
        connection.Received(4).CreateCommand();
    }

    [Fact]
    public void Add_RollsBackTransaction_WhenChildInsertFails()
    {
        var parentCommand = Substitute.For<IDbCommand>();
        var parentParams = Substitute.For<IDataParameterCollection>();
        parentCommand.Parameters.Returns(parentParams);
        parentCommand.ExecuteScalar().Returns(5);

        var failingPlayer = Substitute.For<IDbCommand>();
        var failingParams = Substitute.For<IDataParameterCollection>();
        failingPlayer.Parameters.Returns(failingParams);
        failingPlayer.CreateParameter().Returns(_ => Substitute.For<IDbDataParameter>());
        failingPlayer.When(c => c.ExecuteNonQuery()).Do(_ => throw new InvalidOperationException("db error"));

        connection.CreateCommand().Returns(parentCommand, failingPlayer);

        var repo = new KillerGameRepository(connectionFactory);

        Assert.Throws<InvalidOperationException>(() => repo.Add(new List<KillerGamePlayerRecord>
        {
            new(1, 10, true)
        }));

        transaction.Received(1).Rollback();
        transaction.DidNotReceive().Commit();
    }
}
