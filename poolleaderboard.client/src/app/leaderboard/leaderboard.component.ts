import { Component, input, signal } from '@angular/core';
import { NbActionsModule, NbBadgeModule, NbCardModule, NbIconModule, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from './leaderboard-entry-row.model';
import { TreeNode } from './tree-node.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbIconModule, NbBadgeModule]
})
export class LeaderboardComponent {
  entries = input<TreeNode<LeaderboardEntryRow>[]>([]);
  size = input<'full'|'compact'>('full');
  selectedIds = signal<number[]>([]);

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];

  clickRow(rowId: number) {
    if (!rowId)
      return;
    this.selectedIds.update((oldArray) => {
      const currentIndex = oldArray.indexOf(rowId);
      if (currentIndex === -1)
        return [...oldArray, rowId];
      else
        return oldArray.filter(id => rowId !== id)
    })
  }
}
