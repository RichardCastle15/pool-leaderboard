using System.Data;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngine.Player;

public class HeadToHeadRepository : IHeadToHeadRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public HeadToHeadRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public List<HeadToHeadRecord> GetRecords(int playerId)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();

        var results = new List<HeadToHeadRecord>();

        using var command = connection.CreateCommand();
        command.CommandText =
            "select r.id, r.name, " +
            "sum(case when m.winner_id = @p then 1 else 0 end) as wins, " +
            "sum(case when m.loser_id  = @p then 1 else 0 end) as losses, " +
            "sum(case when m.winner_id = @p then cast(m.winner_delta as int) else 0 end) as points_won, " +
            "sum(case when m.loser_id  = @p then abs(cast(m.loser_delta as int)) else 0 end) as points_lost " +
            "from rating r " +
            "join [match] m on (m.winner_id = @p and m.loser_id = r.id) " +
            "                or (m.loser_id  = @p and m.winner_id = r.id) " +
            "where r.id != @p " +
            "group by r.id, r.name " +
            "order by (sum(case when m.winner_id = @p then 1 else 0 end) + " +
            "          sum(case when m.loser_id  = @p then 1 else 0 end)) desc";
        AddParameter(command, "@p", playerId);

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new HeadToHeadRecord
            {
                OpponentId = (int)reader["id"],
                OpponentName = (string)reader["name"],
                Wins = (int)reader["wins"],
                Losses = (int)reader["losses"],
                PointsWon = (int)reader["points_won"],
                PointsLost = (int)reader["points_lost"]
            });
        }

        return results;
    }

    private static void AddParameter(IDbCommand command, string name, object value)
    {
        var param = command.CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        command.Parameters.Add(param);
    }
}
