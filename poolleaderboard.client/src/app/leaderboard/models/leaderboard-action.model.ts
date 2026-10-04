/** An action on the leaderboard page that makes a network request. Only one may be in flight at a time. */
export type LeaderboardAction = 'addParticipant' | 'recordResult' | 'startKiller';
