using PoolLeaderboardEngine.Killer;

namespace PoolLeaderboardEngineTests.Killer;

public class KillerGameTests
{
    [Fact]
    public void ShouldCreateWithThreeLives()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        KillerGameState initialState = game.GetState();
        Assert.Equal("PersonA", initialState.PlayerRows[0].PlayerName);
        Assert.Equal(3, initialState.PlayerRows[0].LivesRemaining);
        Assert.Equal("PersonB", initialState.PlayerRows[1].PlayerName);
        Assert.Equal(3, initialState.PlayerRows[1].LivesRemaining);
    }

    [Fact]
    public void ShouldDefaultPlayerIndexToFirst()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        KillerGameState initialState = game.GetState();
        Assert.Equal(0, initialState.CurrentPlayerIndex);
    }
}
