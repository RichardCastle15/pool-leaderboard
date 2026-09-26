using System.Data;
using PoolLeaderboardEngine.Leaderboard;
using PoolLeaderboardEngine.Data;

namespace PoolLeaderboardEngine.Killer;

public class KillerGameInProgressRepository : IKillerGameInProgressRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public KillerGameInProgressRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public void Save(KillerGameInProgressState state)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            ClearPersistedGame(connection, transaction);

            using (var insertHeader = connection.CreateCommand())
            {
                insertHeader.Transaction = transaction;
                insertHeader.CommandText =
                    "INSERT INTO killer_game_in_progress (id, current_player_index, sudden_death_state, action_stack) " +
                    "VALUES (1, @currentPlayerIndex, @suddenDeathState, @actionStack)";
                insertHeader.AddParameter("@currentPlayerIndex", state.CurrentPlayerIndex);
                insertHeader.AddParameter("@suddenDeathState", state.SuddenDeathState);
                insertHeader.AddParameter("@actionStack", state.ActionStackJson);
                insertHeader.ExecuteNonQuery();
            }

            foreach (var player in state.Players)
            {
                using var insertPlayer = connection.CreateCommand();
                insertPlayer.Transaction = transaction;
                insertPlayer.CommandText =
                    "INSERT INTO killer_game_in_progress_player (turn_order, rating_id, player_name, lives_remaining, missed_in_sudden_death) " +
                    "VALUES (@turnOrder, @ratingId, @playerName, @livesRemaining, @missedInSuddenDeath)";
                insertPlayer.AddParameter("@turnOrder", player.TurnOrder);
                insertPlayer.AddParameter("@ratingId", player.RatingId);
                insertPlayer.AddParameter("@playerName", player.PlayerName);
                insertPlayer.AddParameter("@livesRemaining", player.LivesRemaining);
                insertPlayer.AddParameter("@missedInSuddenDeath", player.MissedInSuddenDeath);
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

    public KillerGameInProgressState? Load()
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();

        int currentPlayerIndex;
        string suddenDeathState;
        string actionStackJson;

        using (var selectHeader = connection.CreateCommand())
        {
            selectHeader.CommandText =
                "SELECT current_player_index, sudden_death_state, action_stack FROM killer_game_in_progress WHERE id = 1";
            using var reader = selectHeader.ExecuteReader();
            if (!reader.Read())
                return null;
            currentPlayerIndex = Convert.ToInt32(reader["current_player_index"]);
            suddenDeathState = (string)reader["sudden_death_state"];
            actionStackJson = (string)reader["action_stack"];
        }

        var players = new List<KillerGameInProgressPlayer>();
        using (var selectPlayers = connection.CreateCommand())
        {
            selectPlayers.CommandText =
                "SELECT turn_order, rating_id, player_name, lives_remaining, missed_in_sudden_death " +
                "FROM killer_game_in_progress_player ORDER BY turn_order";
            using var reader = selectPlayers.ExecuteReader();
            while (reader.Read())
            {
                players.Add(new KillerGameInProgressPlayer(
                    RatingId: Convert.ToInt32(reader["rating_id"]),
                    PlayerName: (string)reader["player_name"],
                    TurnOrder: Convert.ToInt32(reader["turn_order"]),
                    LivesRemaining: Convert.ToInt32(reader["lives_remaining"]),
                    MissedInSuddenDeath: (bool)reader["missed_in_sudden_death"]
                ));
            }
        }

        return new KillerGameInProgressState(currentPlayerIndex, suddenDeathState, actionStackJson, players);
    }

    public void Delete()
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            ClearPersistedGame(connection, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    /// <summary>
    /// Removes the single persisted game and its players. Both <see cref="Save"/> and
    /// <see cref="Delete"/> start by clearing out whatever is already stored.
    /// </summary>
    private static void ClearPersistedGame(IDbConnection connection, IDbTransaction transaction)
    {
        using (var deletePlayers = connection.CreateCommand())
        {
            deletePlayers.Transaction = transaction;
            deletePlayers.CommandText = "DELETE FROM killer_game_in_progress_player";
            deletePlayers.ExecuteNonQuery();
        }

        using (var deleteHeader = connection.CreateCommand())
        {
            deleteHeader.Transaction = transaction;
            deleteHeader.CommandText = "DELETE FROM killer_game_in_progress";
            deleteHeader.ExecuteNonQuery();
        }
    }
}
