namespace PoolLeaderboardEngine.Killer;

public interface IKillerGameInProgressRepository
{
    void Save(KillerGameInProgressState state);
    KillerGameInProgressState? Load();
    void Delete();
}

public record KillerGameInProgressState(
    int CurrentPlayerIndex,
    string SuddenDeathState,
    string ActionStackJson,
    IReadOnlyList<KillerGameInProgressPlayer> Players
);

public record KillerGameInProgressPlayer(
    int RatingId,
    string PlayerName,
    int TurnOrder,
    int LivesRemaining,
    bool MissedInSuddenDeath
);
