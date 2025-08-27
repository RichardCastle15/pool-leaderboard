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