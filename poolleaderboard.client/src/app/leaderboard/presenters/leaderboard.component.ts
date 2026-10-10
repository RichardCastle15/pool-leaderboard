import { Component, computed, input, OnDestroy, output, Signal, signal } from '@angular/core';
import { NbActionsModule, NbBadgeModule, NbCardModule, NbDialogService, NbIconModule, NbSortDirection, NbSortRequest, NbSpinnerModule, NbTooltipModule, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from '@nebular/theme';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { TreeNode } from '../models/tree-node.model';
import { NewParticipantComponent } from './new-participant/new-participant.component';
import { RecordResultDialogComponent, RecordResultDialogResult } from './record-result-dialog/record-result-dialog.component';
import { Subscription } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { LeaderboardAction } from '../models/leaderboard-action.model';
import { computeEloDelta } from '../services/elo';

/** Fewer players than this is a head-to-head, not a killer game. The server enforces the same minimum. */
export const MIN_KILLER_PLAYERS = 3;

export interface HeadToHeadSwing {
  name: string;
  /** Shown instead of the full name in compact mode, where space is tight. */
  firstName: string;
  /** Points this player would win (and the other lose) if they won. */
  swing: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbIconModule, NbBadgeModule, NbSpinnerModule, NbTooltipModule, TitleCasePipe]
})
export class LeaderboardComponent implements OnDestroy {
  readonly defaultRequest = {column: 'rank', direction: NbSortDirection.ASCENDING};
  readonly loadingDataItem: TreeNode<LeaderboardEntryRow | {}> = {data: {}};
  readonly loadingData: TreeNode<LeaderboardEntryRow | {}>[] = [this.loadingDataItem, this.loadingDataItem, this.loadingDataItem];

  // Inputs.
  entries = input<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  loading = input(false);
  size = input<'full'|'compact'>('full');
  pendingAction = input<LeaderboardAction | null>(null);
  // Outputs.
  newParticipant = output<string>();
  startKiller = output<{ id: number; name: string }[]>();
  recordResult = output<RecordResultDialogResult>();
  // Template data.
  selectedIds = signal<number[]>([]);
  /**
   * While a request is in flight every action is blocked so nothing else can change the leaderboard.
   * nb-action's `disabled` is styling only and still lets clicks through, so handlers check this too.
   */
  busy = computed(() => !!this.pendingAction());
  canRecordResult = computed(() => !this.busy() && this.selectedIds().length === 2);
  canStartKiller = computed(() => !this.busy() && this.selectedIds().length >= MIN_KILLER_PLAYERS);
  /** Explains a disabled Start killer, but only when too few players are selected, not while a request is in flight. */
  showKillerMinimumHint = computed(() => !this.busy() && this.selectedIds().length < MIN_KILLER_PLAYERS);
  readonly killerMinimumHint = `Select at least ${MIN_KILLER_PLAYERS} players for killer (${MIN_KILLER_PLAYERS - 1} players: record a head-to-head)`;
  /** Each selected player's swing if they beat the other, so the points are visible without opening the dialog. */
  headToHeadSwing = computed<[HeadToHeadSwing, HeadToHeadSwing] | null>(() => {
    const selected = this.selectedEntries();
    if (selected.length !== 2)
      return null;
    const [a, b] = selected;
    return [
      { name: a.name, firstName: a.name.split(' ')[0], swing: computeEloDelta(a.points, b.points) },
      { name: b.name, firstName: b.name.split(' ')[0], swing: computeEloDelta(b.points, a.points) }
    ];
  });

  dataSource: Signal<NbTreeGridDataSource<LeaderboardEntryRow | {}>>;
  sortRequest = signal<NbSortRequest>(this.defaultRequest);

  expandableColumn = 'name';
  dataColumns = ['points', 'rank'];
  allColumns = [this.expandableColumn, ...this.dataColumns];

  private subscriptions = new Subscription();

  constructor(
    private readonly dialogService: NbDialogService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<LeaderboardEntryRow | {}>
  ) {
    this.dataSource = computed<NbTreeGridDataSource<LeaderboardEntryRow | {}>>(() => {
      if (this.loading())
        return this.dataSourceBuilder.create(this.loadingData);
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
    if (this.busy())
      return;
    const dialogRef = this.dialogService.open(NewParticipantComponent);
    const dialogCloseSub = dialogRef.onClose.subscribe(result => {
      if (result)
        this.newParticipant.emit(result);
    });
    this.subscriptions.add(dialogCloseSub);
  }

  onStartKiller() {
    if (!this.canStartKiller())
      return;
    const selected = this.selectedEntries().map(e => ({ id: e.id!, name: e.name }));
    this.startKiller.emit(selected);
  }

  onRecordResult() {
    if (!this.canRecordResult())
      return;
    const [playerA, playerB] = this.selectedEntries().map(e => ({ id: e.id!, name: e.name, rating: e.points }));

    const dialogRef = this.dialogService.open(RecordResultDialogComponent, {
      context: { playerA, playerB }
    });
    const sub = dialogRef.onClose.subscribe((result: RecordResultDialogResult | undefined) => {
      if (result) this.recordResult.emit(result);
    });
    this.subscriptions.add(sub);
  }

  private selectedEntries(): LeaderboardEntryRow[] {
    const selectedIds = this.selectedIds();
    return this.entries()
      .map(e => e.data as LeaderboardEntryRow)
      .filter(e => !!e.id && selectedIds.includes(e.id!));
  }
}
