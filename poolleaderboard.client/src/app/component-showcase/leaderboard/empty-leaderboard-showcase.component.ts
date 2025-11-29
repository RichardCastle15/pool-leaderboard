import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/presenters/leaderboard.component';

@Component({
  selector: 'app-empty-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard [entries]="data"></app-leaderboard>
  `,
  styles: ``
})
export class EmptyLeaderboardShowcaseComponent {
  data = [];
}
