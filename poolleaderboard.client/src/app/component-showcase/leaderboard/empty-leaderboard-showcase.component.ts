import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/leaderboard.component';

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
