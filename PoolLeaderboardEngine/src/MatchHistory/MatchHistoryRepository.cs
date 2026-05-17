using System.Data;
using PoolLeaderboardEngine.Leaderboard;

namespace PoolLeaderboardEngine.MatchHistory;

public class MatchHistoryRepository : IMatchHistoryRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public MatchHistoryRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public MatchHistoryPage GetPage(int skip, int take)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();

        int total = GetScalarInt(connection, "select count(*) from [match]")
                  + GetScalarInt(connection, "select count(*) from killer_game");

        int limit = skip + take;

        var oneVsOne = LoadOneVsOne(connection, limit);
        var killer = LoadKiller(connection, limit);

        var merged = oneVsOne
            .Concat(killer)
            .OrderByDescending(e => e.PlayedAt)
            .ThenByDescending(e => e.SortId)
            .Skip(skip)
            .Take(take)
            .Select(e => e.Entry)
            .ToList();

        return new MatchHistoryPage
        {
            Total = total,
            Items = merged
        };
    }

    private static int GetScalarInt(IDbConnection connection, string sql)
    {
        using var command = connection.CreateCommand();
        command.CommandText = sql;
        var scalar = command.ExecuteScalar();
        return scalar == null ? 0 : Convert.ToInt32(scalar);
    }

    private static List<SortableEntry> LoadOneVsOne(IDbConnection connection, int limit)
    {
        var results = new List<SortableEntry>();

        using var command = connection.CreateCommand();
        command.CommandText =
            "select top (@limit) m.id, m.played_at, m.winner_id, w.name as winner_name, " +
            "m.loser_id, l.name as loser_name, m.winner_delta " +
            "from [match] m " +
            "join rating w on w.id = m.winner_id " +
            "join rating l on l.id = m.loser_id " +
            "order by m.played_at desc, m.id desc";
        AddParameter(command, "@limit", limit);

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            var id = (int)reader["id"];
            var playedAt = (DateTime)reader["played_at"];
            results.Add(new SortableEntry(
                playedAt,
                id,
                new MatchHistoryEntry
                {
                    Type = MatchHistoryEntryType.OneVsOne,
                    PlayedAt = playedAt,
                    Winner = new MatchHistoryPlayer
                    {
                        Id = (int)reader["winner_id"],
                        Name = (string)reader["winner_name"]
                    },
                    Loser = new MatchHistoryPlayer
                    {
                        Id = (int)reader["loser_id"],
                        Name = (string)reader["loser_name"]
                    },
                    Delta = (short)reader["winner_delta"]
                }));
        }
        return results;
    }

    private static List<SortableEntry> LoadKiller(IDbConnection connection, int limit)
    {
        var byGameId = new Dictionary<int, (DateTime PlayedAt, List<MatchHistoryKillerPlayer> Players)>();
        var order = new List<int>();

        using var command = connection.CreateCommand();
        command.CommandText =
            "with top_games as (" +
            "  select top (@limit) id, played_at from killer_game order by played_at desc, id desc" +
            ") " +
            "select g.id as game_id, g.played_at, p.id as player_row_id, p.player_id, r.name, p.delta, p.is_winner " +
            "from top_games g " +
            "join killer_game_player p on p.killer_game_id = g.id " +
            "join rating r on r.id = p.player_id " +
            "order by g.played_at desc, g.id desc, p.id asc";
        AddParameter(command, "@limit", limit);

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            var gameId = (int)reader["game_id"];
            if (!byGameId.ContainsKey(gameId))
            {
                byGameId[gameId] = ((DateTime)reader["played_at"], new List<MatchHistoryKillerPlayer>());
                order.Add(gameId);
            }
            byGameId[gameId].Players.Add(new MatchHistoryKillerPlayer
            {
                Id = (int)reader["player_id"],
                Name = (string)reader["name"],
                Delta = (short)reader["delta"],
                IsWinner = (bool)reader["is_winner"]
            });
        }

        return order.Select(gameId => new SortableEntry(
            byGameId[gameId].PlayedAt,
            gameId,
            new MatchHistoryEntry
            {
                Type = MatchHistoryEntryType.Killer,
                PlayedAt = byGameId[gameId].PlayedAt,
                Players = byGameId[gameId].Players
            })).ToList();
    }

    private static void AddParameter(IDbCommand command, string name, object value)
    {
        var param = command.CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        command.Parameters.Add(param);
    }

    private record SortableEntry(DateTime PlayedAt, int SortId, MatchHistoryEntry Entry);
}
