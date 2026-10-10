-- played_at was TIMESTAMP (no time zone) holding the database server's wall clock, which is UTC on the stock
-- postgres image. Convert to timestamptz so the instant is unambiguous and the API can emit it with a "Z".
-- Existing values are interpreted as UTC.
ALTER TABLE "match"
    ALTER COLUMN played_at TYPE TIMESTAMPTZ USING played_at AT TIME ZONE 'UTC',
    ALTER COLUMN played_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE killer_game
    ALTER COLUMN played_at TYPE TIMESTAMPTZ USING played_at AT TIME ZONE 'UTC',
    ALTER COLUMN played_at SET DEFAULT CURRENT_TIMESTAMP;
