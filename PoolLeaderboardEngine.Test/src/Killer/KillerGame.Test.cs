using PoolLeaderboardEngine.Killer;
using PoolLeaderboardEngine.Killer.GameActions;

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
        Assert.Equal(2, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(2, state.PlayerRows[1].LivesRemaining);
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
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
    }

    [Fact]
    public void ShouldEliminateMissedPlayerOnPot()
    {
        List<string> players = ["PersonA", "PersonB", "PersonC"];
        KillerGame game = new(players);

        // All players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        // First player misses
        game.Miss();
        // Second player pots
        game.Pot();

        KillerGameState state = game.GetState();
        Assert.Equal(0, state.PlayerRows[0].LivesRemaining);
    }

    [Fact]
    public void ShouldRestoreMissedPlayerOnUndo()
    {
        List<string> players = ["PersonA", "PersonB", "PersonC"];
        KillerGame game = new(players);

        // All players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        // First player misses
        game.Miss();
        // Second player pots and then is undone
        game.Pot();
        game.Undo();

        KillerGameState state = game.GetState();
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
        Assert.True(state.PlayerRows[0].MissedInSuddenDeath);
    }

    [Fact]
    public void ShouldRestoreLivesIfBothMiss()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        // Both players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        // Both players miss
        game.Miss();
        game.Miss();

        KillerGameState state = game.GetState();
        Assert.False(state.PlayerRows[0].MissedInSuddenDeath);
        Assert.False(state.PlayerRows[1].MissedInSuddenDeath);
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(1, state.PlayerRows[1].LivesRemaining);
    }

    [Fact]
    public void ShouldRestoreStateIfBothMissAndUndoHappens()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        // Both players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        // Both players miss but undo the last miss
        game.Miss();
        game.Miss();
        game.Undo();

        KillerGameState state = game.GetState();
        Assert.True(state.PlayerRows[0].MissedInSuddenDeath);
        Assert.False(state.PlayerRows[1].MissedInSuddenDeath);
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(1, state.PlayerRows[1].LivesRemaining);
    }

    [Fact]
    public void ShouldImmediatelyEliminatePlayerWhoMissesWhenOtherHasPotted()
    {
        List<string> players = ["PersonA", "PersonB"];
        KillerGame game = new(players);

        // Both players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();

        game.Pot();
        game.Miss();

        KillerGameState state = game.GetState();
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
        Assert.Equal(0, state.PlayerRows[1].LivesRemaining);
    }

    #endregion

    #region Game over

    private static void Perform(KillerGame game, string action)
    {
        switch (action)
        {
            case "Pot": game.Pot(); break;
            case "Miss": game.Miss(); break;
            case "EarlyBlackPot": game.EarlyBlackPot(); break;
            default: throw new ArgumentException(action);
        }
    }

    /// <summary>
    /// Four players, the first three pot the black early, leaving PersonD as the winner.
    /// </summary>
    private static KillerGame WonByEarlyBlacks()
    {
        KillerGame game = new(["PersonA", "PersonB", "PersonC", "PersonD"]);
        game.EarlyBlackPot();
        game.EarlyBlackPot();
        game.EarlyBlackPot();
        return game;
    }

    [Fact]
    public void ShouldBeOverWhenOnePlayerRemains()
    {
        KillerGame game = WonByEarlyBlacks();

        Assert.True(game.IsOver);
    }

    [Fact]
    public void ShouldNotBeOverWhileTwoPlayersRemain()
    {
        KillerGame game = new(["PersonA", "PersonB", "PersonC"]);
        game.EarlyBlackPot();

        Assert.False(game.IsOver);
    }

    [Theory]
    [InlineData("Pot")]
    [InlineData("Miss")]
    [InlineData("EarlyBlackPot")]
    public void ShouldRejectActionsOnceGameIsOver(string action)
    {
        KillerGame game = WonByEarlyBlacks();

        Assert.Throws<InvalidOperationException>(() => Perform(game, action));

        // The winner is untouched and still the current player.
        KillerGameState state = game.GetState();
        Assert.Equal(3, state.CurrentPlayerIndex);
        Assert.Equal(3, state.PlayerRows[3].LivesRemaining);
    }

    [Fact]
    public void ShouldRejectMissByWinnerOnLastLife()
    {
        KillerGame game = new(["PersonA", "PersonB"]);
        // Both players to 1 life, then PersonA pots and PersonB misses out in sudden death.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Pot();
        game.Miss();

        Assert.Throws<InvalidOperationException>(game.Miss);
        Assert.Equal(1, game.GetState().PlayerRows[0].LivesRemaining);
    }

    [Fact]
    public void ShouldUndoWinningMoveAfterRejectedAction()
    {
        KillerGame game = WonByEarlyBlacks();
        Assert.Throws<InvalidOperationException>(game.EarlyBlackPot);

        game.Undo();

        // The rejected action was never put on the stack, so one undo reverses the winning early black.
        KillerGameState state = game.GetState();
        Assert.False(game.IsOver);
        Assert.Equal(2, state.CurrentPlayerIndex);
        Assert.Equal(3, state.PlayerRows[2].LivesRemaining);
    }

    [Fact]
    public void ShouldReturnTurnToPotterOnUndoOfSuddenDeathPotThatWinsGame()
    {
        KillerGame game = new(["PersonA", "PersonB"]);
        // Both players to 1 life.
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        // PersonA misses, PersonB pots and so eliminates PersonA.
        game.Miss();
        game.Pot();
        Assert.True(game.IsOver);

        game.Undo();

        KillerGameState state = game.GetState();
        Assert.Equal(1, state.CurrentPlayerIndex);
        Assert.Equal(1, state.PlayerRows[0].LivesRemaining);
        Assert.True(state.PlayerRows[0].MissedInSuddenDeath);
    }

    [Fact]
    public void ShouldReturnTurnToActingPlayerOnUndoAfterRestore()
    {
        KillerGame game = new(["PersonA", "PersonB"]);
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Miss();
        game.Pot();

        KillerGame restored = new(game.GetState(), game.GetActionStack());
        restored.Undo();

        Assert.Equal(1, restored.GetState().CurrentPlayerIndex);
    }

    [Fact]
    public void ShouldStepBackToPreviousAlivePlayerOnUndoOfRecordWithoutPreviousPlayerIndex()
    {
        // Records persisted before the previous player index was tracked deserialise with it as null.
        KillerGameState state = new()
        {
            CurrentPlayerIndex = 2,
            PlayerRows =
            [
                new KillerGameRow { PlayerName = "PersonA", LivesRemaining = 3, MissedInSuddenDeath = false },
                new KillerGameRow { PlayerName = "PersonB", LivesRemaining = 3, MissedInSuddenDeath = false },
                new KillerGameRow { PlayerName = "PersonC", LivesRemaining = 3, MissedInSuddenDeath = false },
            ]
        };
        KillerGame game = new(state, [new PotActionRecord(false, null, false, [])]);

        game.Undo();

        Assert.Equal(1, game.GetState().CurrentPlayerIndex);
    }

    #endregion
}
