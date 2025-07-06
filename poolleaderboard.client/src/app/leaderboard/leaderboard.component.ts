import { Component, input } from '@angular/core';
import { NbCardModule, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from './leaderboard-entry-row.model';
import { TreeNode } from './tree-node.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule]
})
export class LeaderboardComponent {
  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];
  entries = input<TreeNode<LeaderboardEntryRow>[]>([]);
}
