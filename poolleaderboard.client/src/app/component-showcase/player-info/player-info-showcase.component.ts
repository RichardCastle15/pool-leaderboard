import { Component } from '@angular/core';
import { PlayerInfoComponent } from '../../player-info/presenters/player-info.component';
import { MatchHistoryRow } from '../../match-history/models/match-history.model';
import { HeadToHeadRecord } from '../../player-info/models/player-info.model';

@Component({
  selector: 'app-player-info-showcase',
  imports: [PlayerInfoComponent],
  template: `
    <app-player-info
      playerName="Richard"
      [matchEntries]="matchData"
      [matchTotal]="42"
      [matchPageIndex]="0"
      [matchPageSize]="10"
      [headToHead]="h2hData">
    </app-player-info>
  `,
  styles: ``
})
export class PlayerInfoShowcaseComponent {
  matchData: MatchHistoryRow[] = [
    {
      type: 'OneVsOne',
      playedAt: '2026-05-17T15:30:00Z',
      winner: { id: 1, name: 'Richard' },
      loser: { id: 2, name: 'James' },
      delta: 50
    },
    {
      type: 'Killer',
      playedAt: '2026-05-17T14:00:00Z',
      players: [
        { id: 1, name: 'Richard', delta: 20, isWinner: true },
        { id: 2, name: 'James', delta: -10, isWinner: false },
        { id: 3, name: 'Rob', delta: -10, isWinner: false }
      ]
    },
    {
      type: 'OneVsOne',
      playedAt: '2026-05-16T18:00:00Z',
      winner: { id: 3, name: 'Rob' },
      loser: { id: 1, name: 'Richard' },
      delta: 23
    }
  ];

  h2hData: HeadToHeadRecord[] = [
    { opponentId: 2, opponentName: 'James', wins: 8, losses: 3, pointsWon: 320, pointsLost: 90 },
    { opponentId: 3, opponentName: 'Rob', wins: 4, losses: 6, pointsWon: 160, pointsLost: 180 },
    { opponentId: 4, opponentName: 'Stephen B', wins: 2, losses: 1, pointsWon: 80, pointsLost: 30 },
  ];
}
