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
        --gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining;
        moveToNextAlive();
    }

    public void EarlyBlackPot()
    {
        gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining = 0;
        moveToNextAlive();
    }

    public void Undo()
    {
        IGameAction lastAction = gameActions.Pop();
        lastAction.Undo(gameState);
    }

    [Obsolete("Will be handled by game actions")]
    private void moveToNextAlive()
    {
        do
        {
            gameState.CurrentPlayerIndex = (gameState.CurrentPlayerIndex + 1) % gameState.PlayerRows.Count;
        } while (gameState.PlayerRows[gameState.CurrentPlayerIndex].LivesRemaining == 0);
    }
}