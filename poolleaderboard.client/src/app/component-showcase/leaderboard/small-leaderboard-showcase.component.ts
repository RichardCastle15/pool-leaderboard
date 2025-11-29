import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/presenters/leaderboard.component';

@Component({
  selector: 'app-small-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard [entries]="data"></app-leaderboard>
  `,
  styles: ``
})
export class SmallLeaderboardShowcaseComponent {
  data = [
    {
      data: { id: 1, name: 'Richard', points: 1906, rank: 1 },
      children: [
        { data: { name: 'Head-To-Head', points: 1696, rank: 2 } },
        { data: { name: 'Killer', points: 210, rank: 1 } },
      ]
    },
    {
      data: { id: 2, name: 'Russel', points: 1711, rank: 2 },
      children: [
        { data: { name: 'Head-To-Head', points: 1701, rank: 1 } },
        { data: { name: 'Killer', points: 10, rank: 4 } },
      ]
    },
    {
      data: { id: 3, name: 'Stephen B', points: 1440, rank: 3 },
      children: [
        { data: { name: 'Head-To-Head', points: 1400, rank: 3 } },
        { data: { name: 'Killer', points: 40, rank: 3 } },
      ]
    },
  ];
}
