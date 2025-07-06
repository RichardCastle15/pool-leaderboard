import { Component, input } from '@angular/core';
import { NbActionsModule, NbCardModule, NbIconModule, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from './leaderboard-entry-row.model';
import { TreeNode } from './tree-node.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbIconModule]
})
export class LeaderboardComponent {
  entries = input<TreeNode<LeaderboardEntryRow>[]>([]);
  size = input<'full'|'compact'>('full');

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];
}
