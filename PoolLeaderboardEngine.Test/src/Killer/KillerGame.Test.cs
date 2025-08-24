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

    [Fact]
    public void ShouldMoveOnIndexWhenPots()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Pot();

        KillerGameState state = game.GetState();
        Assert.Equal(1, state.CurrentPlayerIndex);
        Assert.Equal(3, state.PlayerRows[0].LivesRemaining);
    }

    [Fact]
    public void ShouldWrapToFirstPlayerOnPotByLast()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Pot();
        game.Pot();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldDeductALifeWhenMiss()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Miss();

        KillerGameState state = game.GetState();
        Assert.Equal(2, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(1, state.CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldWrapToFirstPlayerOnMissByLast()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Miss();
        game.Miss();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldRemoveAllLivesWhenPotBlackEarly()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.EarlyBlackPot();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(1, state.CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldSkipPlayerWithNoLives()
    {
        List<string> players = ["PersonA", "PersonB", "PersonC", "PersonD"];
        KillerGame game = new(players);

        game.EarlyBlackPot();
        game.EarlyBlackPot();
        game.Pot();
        game.Pot();

        KillerGameState state = game.GetState();
        Assert.Equal(2, state.CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldGoBackAPlayerOnUndoPot()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Pot();
        game.Undo();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.CurrentPlayerIndex);
        Assert.All(state.PlayerRows, pr => Assert.Equal(3, pr.LivesRemaining));
    }

    [Fact]
    public void ShouldGoBackAPlayerAndGiveLifeBackOnUndoMiss()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        game.Miss();
        game.Undo();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.CurrentPlayerIndex);
        Assert.All(state.PlayerRows, pr => Assert.Equal(3, pr.LivesRemaining));
    }

    [Fact]
    public void ShouldGivePlayerBackAllLivesOnUndoBlackballPot()
    {
        List<string> players = ["PersonA", "PersonB", "PersonC"];
        KillerGame game = new(players);

        game.Miss();
        game.Pot();
        game.Pot();

        game.EarlyBlackPot();
        game.EarlyBlackPot();

        game.Undo();
        KillerGameState state = game.GetState();
        Assert.Equal(3, state.PlayerRows[state.CurrentPlayerIndex].LivesRemaining);
        Assert.Equal(1, state.CurrentPlayerIndex);

        game.Undo();
        state = game.GetState();
        Assert.Equal(2, state.PlayerRows[state.CurrentPlayerIndex].LivesRemaining);
        Assert.Equal(0, state.CurrentPlayerIndex);
    }

    #region Sudden death

    [Fact]
    public void ShouldNotEliminatePlayerOnMiss()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        // Both players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        // First player misses
        game.Miss();

        KillerGameState state = game.GetState();
        Assert.True(state.PlayerRows[0].MissedInSuddenDeath);
    }

    #endregion
}
