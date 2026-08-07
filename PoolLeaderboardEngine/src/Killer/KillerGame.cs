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

    private static IGameAction ActionFromRecord(KillerGameActionRecord record) => record.ActionType switch
    {
        "Pot" => PotGameAction.FromRecord(record),
        "Miss" => MissGameAction.FromRecord(record),
        "EarlyBlackPot" => PotBlackBallEarlyGameAction.FromRecord(record),
        _ => throw new InvalidOperationException($"Unknown action type: {record.ActionType}")
    };

    public KillerGameState GetState()
    {
        return gameState;
    }

    public void Pot()
    {
        PotGameAction action = new();
        action.Apply(gameState);
        gameActions.Push(action);
    }

    public void Miss()
    {
        MissGameAction action = new();
        action.Apply(gameState);
        gameActions.Push(action);
    }

    public void EarlyBlackPot()
    {
        PotBlackBallEarlyGameAction action = new();
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