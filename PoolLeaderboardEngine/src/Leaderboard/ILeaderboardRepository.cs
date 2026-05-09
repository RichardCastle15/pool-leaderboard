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

        /// <summary>
        /// Adjusts the rating of the specified player by the given delta.
        /// </summary>
        /// <param name="id">The id of the player to update.</param>
        /// <param name="delta">The amount to add to the player's rating (negative to deduct).</param>
        void UpdateRating(int id, int delta);
    }
}
