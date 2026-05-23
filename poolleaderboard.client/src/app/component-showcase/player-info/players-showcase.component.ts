import { Component } from '@angular/core';
import { PlayersComponent } from '../../player-info/presenters/players.component';
import { LeaderboardEntryRow } from '../../leaderboard/models/leaderboard-entry-row.model';

@Component({
  selector: 'app-players-showcase',
  imports: [PlayersComponent],
  template: `<app-players [players]="data"></app-players>`,
  styles: ``
})
export class PlayersShowcaseComponent {
  data: LeaderboardEntryRow[] = [
    { id: 1, name: 'Richard', rank: 1, points: 1180 },
    { id: 2, name: 'James', rank: 2, points: 1050 },
    { id: 3, name: 'Rob', rank: 3, points: 980 },
    { id: 4, name: 'Stephen B', rank: 4, points: 910 },
  ];
}
