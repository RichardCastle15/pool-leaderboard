CREATE TABLE [match] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    winner_id INT NOT NULL,
    loser_id INT NOT NULL,
    winner_delta SMALLINT NOT NULL,
    loser_delta SMALLINT NOT NULL,
    played_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_match_winner FOREIGN KEY (winner_id) REFERENCES rating(id),
    CONSTRAINT FK_match_loser FOREIGN KEY (loser_id) REFERENCES rating(id)
);
