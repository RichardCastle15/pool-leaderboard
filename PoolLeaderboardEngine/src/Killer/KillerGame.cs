using PoolLeaderboardEngine.Killer.GameActions;

namespace PoolLeaderboardEngine.Killer;

public class KillerGame
{
    private KillerGameState gameState;
    private Stack<IGameAction> gameActions = new Stack<IGameAction>();

    public KillerGame(IEnumerable<string> _players)
    {
        gameState = new KillerGameState
        {
            PlayerRows = _players.Select(p => new KillerGameRow { PlayerName = p, LivesRemaining = 3, MissedInSuddenDeath = false }).ToList(),
            CurrentPlayerIndex = 0
        };
    }

    public KillerGame(KillerGameState state, IReadOnlyList<KillerGameActionRecord> actionStack)
    {
        gameState = state;
        // actionStack is ordered top-to-bottom (most recent first); push bottom-first so top ends up on top
        foreach (var record in actionStack.Reverse())
            gameActions.Push(ActionFromRecord(record));
    }

    public IReadOnlyList<KillerGameActionRecord> GetActionStack() =>
        gameActions.Select(a => a.GetRecord()).ToArray();

    private static IGameAction ActionFromRecord(KillerGameActionRecord record) => record switch
    {
        PotActionRecord r => PotGameAction.FromRecord(r),
        MissActionRecord r => MissGameAction.FromRecord(r),
        EarlyBlackPotActionRecord r => PotBlackBallEarlyGameAction.FromRecord(r),
        _ => throw new InvalidOperationException($"Unknown action record: {record.GetType().Name}")
    };

    public KillerGameState GetState()
    {
        return gameState;
    }

    /// <summary>
    /// True once one player (or fewer) has lives left. Only <see cref="Undo"/> is allowed from here.
    /// </summary>
    public bool IsOver => gameState.PlayerRows.Count(r => r.LivesRemaining > 0) <= 1;

    public void Pot() => Perform(new PotGameAction());

    public void Miss() => Perform(new MissGameAction());

    public void EarlyBlackPot() => Perform(new PotBlackBallEarlyGameAction());

    private void Perform(IGameAction action)
    {
        // An action after the win would at best leave extra moves to undo before the winning one, and at worst
        // eliminate the winner too, leaving no one to take the next shot.
        if (IsOver)
            throw new InvalidOperationException("The game is over. Undo the last action or confirm the end.");
        action.Apply(gameState);
        gameActions.Push(action);
    }

    public void Undo()
    {
        if (!gameActions.Any())
            throw new Exception("No actions have been performed to undo.");
        IGameAction lastAction = gameActions.Pop();
        lastAction.Undo(gameState);
    }
}