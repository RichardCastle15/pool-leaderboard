import { Component, computed, input, OnDestroy, output, Signal, signal } from '@angular/core';
import { NbActionsModule, NbBadgeModule, NbCardModule, NbDialogService, NbIconModule, NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from '@nebular/theme';
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

  dataSource: Signal<NbTreeGridDataSource<LeaderboardEntryRow>>;
  sortColumn: string = 'rank';
  sortDirection: NbSortDirection = NbSortDirection.ASCENDING;

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];

  private subscriptions = new Subscription();

  constructor(
    private readonly dialogService: NbDialogService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<LeaderboardEntryRow>
  ) {
    this.dataSource = computed<NbTreeGridDataSource<LeaderboardEntryRow>>(() => {
      return this.dataSourceBuilder.create(this.entries());
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
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
