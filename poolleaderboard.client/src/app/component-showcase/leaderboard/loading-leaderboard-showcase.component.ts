import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/presenters/leaderboard.component';

@Component({
  selector: 'app-loading-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard [loading]="true"></app-leaderboard>
  `,
  styles: ``
})
export class LoadingLeaderboardShowcaseComponent {

}
