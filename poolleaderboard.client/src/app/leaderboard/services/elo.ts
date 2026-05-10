// NOTE: duplicated from PoolLeaderboardEngine/src/Elo/EloCalculator.cs
// (used here so the result-recording dialog can preview the swing).
// Keep both implementations in sync — the backend is the source of truth on submit.

export const ELO_DEFAULT_K = 100;
export const ELO_MIN_DELTA = 5;
export const ELO_MAX_DELTA = 95;

export function computeEloDelta(winnerRating: number, loserRating: number, k = ELO_DEFAULT_K): number {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const raw = Math.round(k * (1 - expectedWinner));
  return Math.min(ELO_MAX_DELTA, Math.max(ELO_MIN_DELTA, raw));
}
