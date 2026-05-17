using System.Data;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngine.Killer;

public class KillerGameRepository : IKillerGameRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public KillerGameRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public void Add(IReadOnlyList<KillerGamePlayerRecord> players)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            int killerGameId;
            using (var insertGame = connection.CreateCommand())
            {
                insertGame.Transaction = transaction;
                insertGame.CommandText =
                    "insert into killer_game default values; select cast(SCOPE_IDENTITY() as int);";
                var scalar = insertGame.ExecuteScalar();
                killerGameId = Convert.ToInt32(scalar);
            }

            foreach (var player in players)
            {
                using var insertPlayer = connection.CreateCommand();
                insertPlayer.Transaction = transaction;
                insertPlayer.CommandText =
                    "insert into killer_game_player (killer_game_id, player_id, delta, is_winner) " +
                    "values (@killerGameId, @playerId, @delta, @isWinner)";
                AddParameter(insertPlayer, "@killerGameId", killerGameId);
                AddParameter(insertPlayer, "@playerId", player.PlayerId);
                AddParameter(insertPlayer, "@delta", player.Delta);
                AddParameter(insertPlayer, "@isWinner", player.IsWinner);
                insertPlayer.ExecuteNonQuery();
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private static void AddParameter(IDbCommand command, string name, object value)
    {
        var param = command.CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        command.Parameters.Add(param);
    }
}
