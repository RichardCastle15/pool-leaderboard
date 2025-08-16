import { Component, computed, input, OnDestroy, output, Signal, signal } from '@angular/core';
import { NbActionsModule, NbBadgeModule, NbCardModule, NbDialogService, NbIconModule, NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from './leaderboard-entry-row.model';
import { TreeNode } from './tree-node.model';
import { NewParticipantComponent } from './new-participant/new-participant.component';
import { Subscription } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbIconModule, NbBadgeModule, TitleCasePipe]
})
export class LeaderboardComponent implements OnDestroy {
  readonly defaultRequest = {column: 'rank', direction: NbSortDirection.ASCENDING};

  entries = input<TreeNode<LeaderboardEntryRow>[]>([]);
  size = input<'full'|'compact'>('full');
  selectedIds = signal<number[]>([]);
  newParticipant = output<string>();

  dataSource: Signal<NbTreeGridDataSource<LeaderboardEntryRow>>;
  sortRequest = signal<NbSortRequest>(this.defaultRequest)

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];

  private subscriptions = new Subscription();

  constructor(
    private readonly dialogService: NbDialogService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<LeaderboardEntryRow>
  ) {
    this.dataSource = computed<NbTreeGridDataSource<LeaderboardEntryRow>>(() => {
      const result = this.dataSourceBuilder.create(this.entries());
      result.sort(this.sortRequest());
      return result;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateSort(sortRequest: NbSortRequest): void {
    const requestToUse = sortRequest.direction === NbSortDirection.NONE ? this.defaultRequest : sortRequest;
    this.sortRequest.set(requestToUse);
  }

  getSortDirection(column: string): NbSortDirection {
    const currentRequest = this.sortRequest();
    if (currentRequest.column === column) {
      return currentRequest.direction;
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
