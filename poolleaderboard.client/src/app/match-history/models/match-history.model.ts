export interface MatchHistoryPlayer {
  id: number;
  name: string;
}

export interface MatchHistoryKillerPlayer {
  id: number;
  name: string;
  delta: number;
  isWinner: boolean;
}

export interface OneVsOneMatchRow {
  type: 'OneVsOne';
  playedAt: string;
  winner: MatchHistoryPlayer;
  loser: MatchHistoryPlayer;
  delta: number;
}

export interface KillerMatchRow {
  type: 'Killer';
  playedAt: string;
  players: MatchHistoryKillerPlayer[];
}

export type MatchHistoryRow = OneVsOneMatchRow | KillerMatchRow;

export interface MatchHistoryPage {
  total: number;
  items: MatchHistoryRow[];
}
