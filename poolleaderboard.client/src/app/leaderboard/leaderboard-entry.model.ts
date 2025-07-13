import { LeaderboardEntryRow } from "./leaderboard-entry-row.model";

export type LeaderboardEntry = LeaderboardEntryRow & { children: LeaderboardEntryRow[] };
