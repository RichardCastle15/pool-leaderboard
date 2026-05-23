namespace PoolLeaderboardEngine.Player;

public interface IHeadToHeadRepository
{
    List<HeadToHeadRecord> GetRecords(int playerId);
}
