CREATE TABLE killer_game_in_progress (
    id INTEGER NOT NULL,
    current_player_index INTEGER NOT NULL,
    sudden_death_state TEXT NOT NULL,
    action_stack TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT pk_killer_game_in_progress PRIMARY KEY (id),
    CONSTRAINT chk_killer_game_in_progress_single_row CHECK (id = 1)
);

CREATE TABLE killer_game_in_progress_player (
    id SERIAL NOT NULL,
    turn_order INTEGER NOT NULL,
    rating_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    lives_remaining INTEGER NOT NULL,
    missed_in_sudden_death BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_killer_game_in_progress_player PRIMARY KEY (id),
    CONSTRAINT fk_killer_game_in_progress_player_rating FOREIGN KEY (rating_id) REFERENCES rating(id)
);
