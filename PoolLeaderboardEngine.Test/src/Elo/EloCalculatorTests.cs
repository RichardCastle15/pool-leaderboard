using PoolLeaderboardEngine.Elo;

namespace PoolLeaderboardEngineTests.Elo;

public class EloCalculatorTests
{
    [Fact]
    public void Compute_EqualRatings_ReturnsFiftyFifty()
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(1000, 1000);

        Assert.Equal(50, winnerDelta);
        Assert.Equal(-50, loserDelta);
    }

    [Fact]
    public void Compute_FourHundredGap_HigherWins_ReturnsNine()
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(1400, 1000);

        Assert.Equal(9, winnerDelta);
        Assert.Equal(-9, loserDelta);
    }

    [Fact]
    public void Compute_FourHundredGap_LowerWins_ReturnsNinetyOne()
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(1000, 1400);

        Assert.Equal(91, winnerDelta);
        Assert.Equal(-91, loserDelta);
    }

    [Fact]
    public void Compute_EightHundredGap_HigherWins_ClampedToFloor()
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(1800, 1000);

        Assert.Equal(EloCalculator.MinDelta, winnerDelta);
        Assert.Equal(-EloCalculator.MinDelta, loserDelta);
    }

    [Fact]
    public void Compute_EightHundredGap_LowerWins_ClampedToCeiling()
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(1000, 1800);

        Assert.Equal(EloCalculator.MaxDelta, winnerDelta);
        Assert.Equal(-EloCalculator.MaxDelta, loserDelta);
    }

    [Fact]
    public void Compute_HugeGap_StaysClamped()
    {
        var (highWinner, _) = EloCalculator.Compute(3000, 1000);
        var (lowWinner, _) = EloCalculator.Compute(1000, 3000);

        Assert.Equal(EloCalculator.MinDelta, highWinner);
        Assert.Equal(EloCalculator.MaxDelta, lowWinner);
    }

    [Theory]
    [InlineData(1000, 1000)]
    [InlineData(1400, 1000)]
    [InlineData(1000, 1400)]
    [InlineData(1800, 1000)]
    [InlineData(1000, 1800)]
    public void Compute_DeltasAreSymmetric(int winnerRating, int loserRating)
    {
        var (winnerDelta, loserDelta) = EloCalculator.Compute(winnerRating, loserRating);

        Assert.Equal(0, winnerDelta + loserDelta);
    }
}
