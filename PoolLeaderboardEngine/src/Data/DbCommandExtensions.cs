using System.Data;

namespace PoolLeaderboardEngine.Data;

/// <summary>
/// Helpers shared by the raw ADO.NET repositories.
/// </summary>
public static class DbCommandExtensions
{
    /// <summary>
    /// Adds a named parameter to the command, mapping a null value to <see cref="DBNull"/>.
    /// </summary>
    public static void AddParameter(this IDbCommand command, string name, object? value)
    {
        var param = command.CreateParameter();
        param.ParameterName = name;
        param.Value = value ?? DBNull.Value;
        command.Parameters.Add(param);
    }
}
