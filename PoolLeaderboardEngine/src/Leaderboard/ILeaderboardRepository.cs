namespace PoolLeaderboardEngine.Leaderboard
{
    /// <summary>
    /// Defines operations for accessing and modifying leaderboard entries.
    /// </summary>
    public interface ILeaderboardRepository
    {
        /// <summary>
        /// Gets all leaderboard entries.
        /// </summary>
        /// <returns>A list containing all <see cref="LeaderboardEntry"/> items.</returns>
        List<LeaderboardEntry> GetAll();

        /// <summary>
        /// Adds a new entry to the leaderboard for the specified player name.
        /// </summary>
        /// <param name="name">The name of the player to add to the leaderboard.</param>
        void Add(string name);
    }
}
