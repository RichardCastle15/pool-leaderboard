import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/presenters/leaderboard.component';

@Component({
  selector: 'app-pending-action-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard [entries]="data" pendingAction="recordResult"></app-leaderboard>
  `,
  styles: ``
})
export class PendingActionLeaderboardShowcaseComponent {
  data = [
    { data: { id: 1, name: 'Richard', points: 1906, rank: 1 } },
    { data: { id: 2, name: 'Russel', points: 1711, rank: 2 } },
    { data: { id: 3, name: 'Stephen B', points: 1440, rank: 3 } },
  ];
}
