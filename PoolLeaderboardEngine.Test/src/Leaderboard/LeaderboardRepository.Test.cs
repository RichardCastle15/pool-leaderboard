using System.Data;
using NSubstitute;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngineTests.Leaderboard;

public class LeaderboardRepositoryTests
{
    private readonly IDbConnectionFactory connectionFactory = Substitute.For<IDbConnectionFactory>();
    private readonly IDbConnection connection = Substitute.For<IDbConnection>();
    private readonly IDbCommand command = Substitute.For<IDbCommand>();
    private readonly IDataParameterCollection parameters = Substitute.For<IDataParameterCollection>();

    public LeaderboardRepositoryTests()
    {
        connectionFactory.CreateConnection().Returns(connection);
        connection.CreateCommand().Returns(command);
        command.Parameters.Returns(parameters);
    }

    [Fact]
    public void ExistsByName_OpensConnection()
    {
        var scalar = Substitute.For<IDbCommand>();
        scalar.Parameters.Returns(parameters);
        scalar.ExecuteScalar().Returns(0);
        command.ExecuteScalar().Returns(0);
        var repo = new LeaderboardRepository(connectionFactory);

        repo.ExistsByName("Alice");

        connection.Received().Open();
    }

    [Fact]
    public void ExistsByName_SetsCorrectCommandText()
    {
        command.ExecuteScalar().Returns(0);
        var repo = new LeaderboardRepository(connectionFactory);

        repo.ExistsByName("Alice");

        Assert.Equal(
            "SELECT COUNT(1) FROM rating WHERE name = @name COLLATE SQL_Latin1_General_CP1_CI_AS",
            command.CommandText);
    }

    [Fact]
    public void ExistsByName_CreatesNameParameterWithCorrectValue()
    {
        var param = Substitute.For<IDbDataParameter>();
        command.CreateParameter().Returns(param);
        command.ExecuteScalar().Returns(0);
        var repo = new LeaderboardRepository(connectionFactory);

        repo.ExistsByName("Alice");

        Assert.Equal("@name", param.ParameterName);
        Assert.Equal("Alice", param.Value);
    }

    [Fact]
    public void ExistsByName_ReturnsFalse_WhenCountIsZero()
    {
        command.ExecuteScalar().Returns(0);
        var repo = new LeaderboardRepository(connectionFactory);

        var result = repo.ExistsByName("Alice");

        Assert.False(result);
    }

    [Fact]
    public void ExistsByName_ReturnsTrue_WhenCountIsGreaterThanZero()
    {
        command.ExecuteScalar().Returns(1);
        var repo = new LeaderboardRepository(connectionFactory);

        var result = repo.ExistsByName("Alice");

        Assert.True(result);
    }

    [Fact]
    public void Add_OpensConnection()
    {
        var repo = new LeaderboardRepository(connectionFactory);

        repo.Add("Alice");

        connection.Received(1).Open();
    }

    [Fact]
    public void Add_SetsInsertCommandText()
    {
        var repo = new LeaderboardRepository(connectionFactory);

        repo.Add("Alice");

        Assert.Equal("insert into rating (name, rating) values (@name, 1000)", command.CommandText);
    }

    [Fact]
    public void Add_CreatesNameParameterWithCorrectValue()
    {
        var param = Substitute.For<IDbDataParameter>();
        command.CreateParameter().Returns(param);
        var repo = new LeaderboardRepository(connectionFactory);

        repo.Add("Alice");

        Assert.Equal("@name", param.ParameterName);
        Assert.Equal("Alice", param.Value);
    }

    [Fact]
    public void Add_AddsParameterToCommand()
    {
        var param = Substitute.For<IDbDataParameter>();
        command.CreateParameter().Returns(param);
        var repo = new LeaderboardRepository(connectionFactory);

        repo.Add("Alice");

        parameters.Received(1).Add(param);
    }

    [Fact]
    public void Add_ExecutesNonQuery()
    {
        var repo = new LeaderboardRepository(connectionFactory);

        repo.Add("Alice");

        command.Received(1).ExecuteNonQuery();
    }

    [Fact]
    public void GetAll_OpensConnection()
    {
        SetupReaderWithNoRows();
        var repo = new LeaderboardRepository(connectionFactory);

        repo.GetAll();

        connection.Received(1).Open();
    }

    [Fact]
    public void GetAll_SetsSelectCommandText()
    {
        SetupReaderWithNoRows();
        var repo = new LeaderboardRepository(connectionFactory);

        repo.GetAll();

        Assert.Equal("select * from rating", command.CommandText);
    }

    [Fact]
    public void GetAll_ReturnsEmptyListWhenNoRows()
    {
        SetupReaderWithNoRows();
        var repo = new LeaderboardRepository(connectionFactory);

        var result = repo.GetAll();

        Assert.Empty(result);
    }

    [Fact]
    public void GetAll_ReturnsMappedEntries()
    {
        var reader = Substitute.For<IDataReader>();
        reader.Read().Returns(true, true, false);
        reader["name"].Returns("Alice", "Bob");
        reader["rating"].Returns((short)1200, (short)900);
        reader["id"].Returns(1, 2);
        command.ExecuteReader().Returns(reader);

        var repo = new LeaderboardRepository(connectionFactory);

        var result = repo.GetAll();

        Assert.Equal(2, result.Count);

        Assert.Equal("Alice", result[0].Name);
        Assert.Equal((short)1200, result[0].Rating);
        Assert.Equal(1, result[0].Id);

        Assert.Equal("Bob", result[1].Name);
        Assert.Equal((short)900, result[1].Rating);
        Assert.Equal(2, result[1].Id);
    }

    private void SetupReaderWithNoRows()
    {
        var reader = Substitute.For<IDataReader>();
        reader.Read().Returns(false);
        command.ExecuteReader().Returns(reader);
    }
}
