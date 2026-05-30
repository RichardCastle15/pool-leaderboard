using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngine.Match;

public class MatchRepository : IMatchRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public MatchRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public void Add(int winnerId, int loserId, int winnerDelta, int loserDelta)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText =
            "insert into \"match\" (winner_id, loser_id, winner_delta, loser_delta) " +
            "values (@winnerId, @loserId, @winnerDelta, @loserDelta)";

        AddParameter(command, "@winnerId", winnerId);
        AddParameter(command, "@loserId", loserId);
        AddParameter(command, "@winnerDelta", winnerDelta);
        AddParameter(command, "@loserDelta", loserDelta);

        command.ExecuteNonQuery();
    }

    private static void AddParameter(System.Data.IDbCommand command, string name, object value)
    {
        var param = command.CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        command.Parameters.Add(param);
    }
}
