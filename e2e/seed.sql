-- Baseline data every E2E test starts from (applied by fixtures.ts before each test).
-- RESTART IDENTITY means ids are predictable: players are 1..4 in insert order.
TRUNCATE rating, "match", killer_game, killer_game_player,
         killer_game_in_progress, killer_game_in_progress_player
  RESTART IDENTITY CASCADE;

INSERT INTO rating (name, rating) VALUES
  ('Alice A', 1100),  -- id 1
  ('Bob B',   1050),  -- id 2
  ('Carol C', 1000),  -- id 3
  ('Dave D',   950);  -- id 4

INSERT INTO "match" (winner_id, loser_id, winner_delta, loser_delta, played_at) VALUES
  (1, 2, 43, -43, '2026-01-05 12:00:00+00'),
  (3, 4, 50, -50, '2026-01-06 12:00:00+00'),
  (2, 3, 48, -48, '2026-01-07 12:00:00+00');
