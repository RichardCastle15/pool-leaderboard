import { Component, input, OnDestroy, output, signal } from '@angular/core';
import { NbActionsModule, NbBadgeModule, NbCardModule, NbDialogService, NbIconModule, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from './leaderboard-entry-row.model';
import { TreeNode } from './tree-node.model';
import { NewParticipantComponent } from './new-participant/new-participant.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbIconModule, NbBadgeModule]
})
export class LeaderboardComponent implements OnDestroy {
  entries = input<TreeNode<LeaderboardEntryRow>[]>([]);
  size = input<'full'|'compact'>('full');
  selectedIds = signal<number[]>([]);
  newParticipant = output<string>();

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];

  private subscriptions = new Subscription();

  constructor(private readonly dialogService: NbDialogService) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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

  openNewParticipantDialog() {
    const dialogRef = this.dialogService.open(NewParticipantComponent);
    const dialogCloseSub = dialogRef.onClose.subscribe(result => {
      if (result)
        this.newParticipant.emit(result);
    });
    this.subscriptions.add(dialogCloseSub);
  }
}
