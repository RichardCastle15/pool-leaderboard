import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/leaderboard.component';

@Component({
  selector: 'app-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard></app-leaderboard>
  `,
  styles: ``
})
export class LeaderboardShowcaseComponent {

}
