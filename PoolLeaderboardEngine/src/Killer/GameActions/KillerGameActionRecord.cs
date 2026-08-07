namespace PoolLeaderboardEngine.Killer.GameActions;

public record KillerGameActionRecord(
    string ActionType,
    bool CausedSuddenDeath,
    bool WasFirstPotInSuddenDeath,
    int[] PlayersEliminatedInSuddenDeath,
    int? PlayerIndexOfLifeTaken,
    int[]? PlayersRestoredByMiss,
    int? EarlyBlackPotPlayerIndex,
    int? EarlyBlackPotLivesTaken
);
