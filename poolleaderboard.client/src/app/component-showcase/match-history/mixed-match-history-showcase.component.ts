import { Component } from '@angular/core';
import { MatchHistoryComponent } from '../../match-history/presenters/match-history.component';
import { MatchHistoryRow } from '../../match-history/models/match-history.model';

@Component({
  selector: 'app-mixed-match-history-showcase',
  imports: [MatchHistoryComponent],
  template: `
    <app-match-history [entries]="data" [total]="42" [pageIndex]="0" [pageSize]="10"></app-match-history>
  `,
  styles: ``
})
export class MixedMatchHistoryShowcaseComponent {
  data: MatchHistoryRow[] = [
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
      playedAt: '2026-05-17T12:15:00Z',
      winner: { id: 3, name: 'Rob' },
      loser: { id: 1, name: 'Richard' },
      delta: 23
    },
    {
      type: 'Killer',
      playedAt: '2026-05-16T20:45:00Z',
      players: [
        { id: 4, name: 'Stephen B', delta: 30, isWinner: true },
        { id: 1, name: 'Richard', delta: -10, isWinner: false },
        { id: 2, name: 'James', delta: -10, isWinner: false },
        { id: 3, name: 'Rob', delta: -10, isWinner: false }
      ]
    },
    {
      type: 'OneVsOne',
      playedAt: '2026-05-16T18:00:00Z',
      winner: { id: 2, name: 'James' },
      loser: { id: 4, name: 'Stephen B' },
      delta: 38
    }
  ];
}
