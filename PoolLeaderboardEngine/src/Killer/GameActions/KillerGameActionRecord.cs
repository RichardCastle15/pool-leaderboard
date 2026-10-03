using System.Text.Json.Serialization;

namespace PoolLeaderboardEngine.Killer.GameActions;

/// <summary>
/// The serialisable undo-state of a single game action, used to persist and restore the
/// undo stack. Each concrete action owns its own record type rather than sharing one flat
/// record of per-type nullable fields, so the JSON discriminator is declared once, next to
/// the type it names, and the restore switch in <see cref="KillerGame"/> matches on types
/// the compiler checks instead of hand-written strings.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "actionType")]
[JsonDerivedType(typeof(PotActionRecord), PotActionRecord.ActionType)]
[JsonDerivedType(typeof(MissActionRecord), MissActionRecord.ActionType)]
[JsonDerivedType(typeof(EarlyBlackPotActionRecord), EarlyBlackPotActionRecord.ActionType)]
/// <remarks>
/// <c>PreviousPlayerIndex</c> is null in records persisted before it was added; undo then falls back to
/// stepping back to the previous alive player.
/// </remarks>
public abstract record KillerGameActionRecord(bool CausedSuddenDeath, int? PreviousPlayerIndex);

/// <summary>Undo-state of <c>PotGameAction</c>.</summary>
public record PotActionRecord(
    bool CausedSuddenDeath,
    int? PreviousPlayerIndex,
    bool WasFirstPotInSuddenDeath,
    int[] PlayersEliminatedInSuddenDeath) : KillerGameActionRecord(CausedSuddenDeath, PreviousPlayerIndex)
{
    public const string ActionType = "Pot";
}

/// <summary>Undo-state of <c>MissGameAction</c>.</summary>
public record MissActionRecord(
    bool CausedSuddenDeath,
    int? PreviousPlayerIndex,
    int? PlayerIndexOfLifeTaken,
    int[]? PlayersRestoredByMiss) : KillerGameActionRecord(CausedSuddenDeath, PreviousPlayerIndex)
{
    public const string ActionType = "Miss";
}

/// <summary>Undo-state of <c>PotBlackBallEarlyGameAction</c>.</summary>
public record EarlyBlackPotActionRecord(
    bool CausedSuddenDeath,
    int? PreviousPlayerIndex,
    int? PlayerIndex,
    int? LivesTaken) : KillerGameActionRecord(CausedSuddenDeath, PreviousPlayerIndex)
{
    public const string ActionType = "EarlyBlackPot";
}
