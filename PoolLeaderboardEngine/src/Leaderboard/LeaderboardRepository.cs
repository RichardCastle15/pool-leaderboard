namespace PoolLeaderboardEngine.Leaderboard;

public class LeaderboardRepository : ILeaderboardRepository
{
    private readonly IDbConnectionFactory dbConnectionFactory;

    public LeaderboardRepository(IDbConnectionFactory dbConnectionFactory)
    {
        this.dbConnectionFactory = dbConnectionFactory;
    }

    public void Add(string name)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "insert into rating (name, rating) values (@name, 1000)";
        var param = command.CreateParameter();
        param.ParameterName = "@name";
        param.Value = name;
        command.Parameters.Add(param);
        command.ExecuteNonQuery();
    }

    public void UpdateRating(int id, int delta)
    {
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "UPDATE rating SET rating = rating + @delta WHERE id = @id";
        var deltaParam = command.CreateParameter();
        deltaParam.ParameterName = "@delta";
        deltaParam.Value = delta;
        command.Parameters.Add(deltaParam);
        var idParam = command.CreateParameter();
        idParam.ParameterName = "@id";
        idParam.Value = id;
        command.Parameters.Add(idParam);
        command.ExecuteNonQuery();
    }

    public List<LeaderboardEntry> GetAll()
    {
        var entries = new List<LeaderboardEntry>();
        using var connection = dbConnectionFactory.CreateConnection();
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "select * from rating";
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            entries.Add(new LeaderboardEntry
            {
                Name = (string)reader["name"],
                Rating = (short)reader["rating"],
                Id = (int)reader["id"]
            });
        }
        return entries;
    }
}
