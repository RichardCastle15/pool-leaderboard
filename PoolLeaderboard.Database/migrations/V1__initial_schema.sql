CREATE TABLE rating (
    id INT GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_rating_id PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rating SMALLINT NOT NULL,
    CONSTRAINT uq_rating_name UNIQUE (name)
);

CREATE TABLE "match" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    winner_id INT NOT NULL,
    loser_id INT NOT NULL,
    winner_delta SMALLINT NOT NULL,
    loser_delta SMALLINT NOT NULL,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_winner FOREIGN KEY (winner_id) REFERENCES rating(id),
    CONSTRAINT fk_match_loser FOREIGN KEY (loser_id) REFERENCES rating(id)
);

CREATE TABLE killer_game (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE killer_game_player (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    killer_game_id INT NOT NULL,
    player_id INT NOT NULL,
    delta SMALLINT NOT NULL,
    is_winner BOOLEAN NOT NULL,
    CONSTRAINT fk_killer_game_player_killer_game FOREIGN KEY (killer_game_id) REFERENCES killer_game(id),
    CONSTRAINT fk_killer_game_player_rating FOREIGN KEY (player_id) REFERENCES rating(id)
);

CREATE INDEX ix_killer_game_player_game ON killer_game_player(killer_game_id);
