namespace PoolLeaderboardEngine.Elo;

// NOTE: duplicated in poolleaderboard.client/src/app/leaderboard/services/elo.ts
// for the dialog preview. Keep both implementations in sync.
public static class EloCalculator
{
    public const int DefaultK = 100;
    public const int MinDelta = 5;
    public const int MaxDelta = 95;

    public static (int WinnerDelta, int LoserDelta) Compute(
        int winnerRating, int loserRating, int k = DefaultK)
    {
        var expectedWinner = 1.0 / (1.0 + Math.Pow(10, (loserRating - winnerRating) / 400.0));
        var raw = (int)Math.Round(k * (1.0 - expectedWinner), MidpointRounding.AwayFromZero);
        var winnerDelta = Math.Clamp(raw, MinDelta, MaxDelta);
        return (winnerDelta, -winnerDelta);
    }
}
