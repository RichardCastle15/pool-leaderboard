import { Component } from '@angular/core';
import { MatchHistoryComponent } from '../../match-history/presenters/match-history.component';
import { MatchHistoryRow } from '../../match-history/models/match-history.model';

@Component({
  selector: 'app-last-page-partial-match-history-showcase',
  imports: [MatchHistoryComponent],
  template: `
    <app-match-history [entries]="data" [total]="43" [pageIndex]="4" [pageSize]="10"></app-match-history>
  `,
  styles: ``
})
export class LastPagePartialMatchHistoryShowcaseComponent {
  data: MatchHistoryRow[] = [
    {
      type: 'OneVsOne',
      playedAt: '2026-04-01T10:30:00Z',
      winner: { id: 1, name: 'Richard' },
      loser: { id: 2, name: 'James' },
      delta: 50
    },
    {
      type: 'Killer',
      playedAt: '2026-03-28T19:00:00Z',
      players: [
        { id: 2, name: 'James', delta: 10, isWinner: true },
        { id: 1, name: 'Richard', delta: -10, isWinner: false }
      ]
    },
    {
      type: 'OneVsOne',
      playedAt: '2026-03-15T16:00:00Z',
      winner: { id: 4, name: 'Stephen B' },
      loser: { id: 3, name: 'Rob' },
      delta: 27
    }
  ];
}
