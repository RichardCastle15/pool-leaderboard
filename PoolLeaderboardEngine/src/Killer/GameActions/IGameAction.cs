namespace PoolLeaderboardEngine.Killer.GameActions;

internal interface IGameAction
{
    void Apply(KillerGameState toGame);

    void Undo(KillerGameState toGame);
}