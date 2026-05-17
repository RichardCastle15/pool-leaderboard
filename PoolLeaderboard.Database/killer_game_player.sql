CREATE TABLE killer_game_player (
    id INT IDENTITY(1,1) PRIMARY KEY,
    killer_game_id INT NOT NULL,
    player_id INT NOT NULL,
    delta SMALLINT NOT NULL,
    is_winner BIT NOT NULL,
    FOREIGN KEY (killer_game_id) REFERENCES killer_game(id),
    FOREIGN KEY (player_id) REFERENCES rating(id)
);
CREATE INDEX IX_killer_game_player_game ON killer_game_player(killer_game_id);
