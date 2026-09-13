using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Data;

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

        command.AddParameter("@winnerId", winnerId);
        command.AddParameter("@loserId", loserId);
        command.AddParameter("@winnerDelta", winnerDelta);
        command.AddParameter("@loserDelta", loserDelta);

        command.ExecuteNonQuery();
    }

}
