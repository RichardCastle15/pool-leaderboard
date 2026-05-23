import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NbButtonModule, NbCardModule, NbIconModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { KillerMatchRow, MatchHistoryRow, OneVsOneMatchRow } from '../../match-history/models/match-history.model';
import { HeadToHeadRecord } from '../models/player-info.model';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
  imports: [DatePipe, NbCardModule, NbListModule, NbButtonModule, NbIconModule, NbSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerInfoComponent {
  playerName = input('');
  matchEntries = input<MatchHistoryRow[]>([]);
  matchLoading = input(false);
  matchPageIndex = input(0);
  matchPageSize = input(10);
  matchTotal = input(0);
  headToHead = input<HeadToHeadRecord[]>([]);
  headToHeadLoading = input(false);

  pageChange = output<number>();

  pageLabel = computed(() => {
    const totalPages = Math.max(1, Math.ceil(this.matchTotal() / this.matchPageSize()));
    return `Page ${this.matchPageIndex() + 1} of ${totalPages}`;
  });

  isPrevDisabled = computed(() => this.matchPageIndex() === 0);
  isNextDisabled = computed(
    () => (this.matchPageIndex() + 1) * this.matchPageSize() >= this.matchTotal()
  );

  isOneVsOne(row: MatchHistoryRow): row is OneVsOneMatchRow {
    return row.type === 'OneVsOne';
  }

  asOneVsOne(row: MatchHistoryRow): OneVsOneMatchRow {
    return row as OneVsOneMatchRow;
  }

  asKiller(row: MatchHistoryRow): KillerMatchRow {
    return row as KillerMatchRow;
  }

  formatDelta(delta: number): string {
    return delta >= 0 ? `+${delta}` : `${delta}`;
  }

  winPct(record: HeadToHeadRecord): string {
    const total = record.wins + record.losses;
    if (total === 0) return '0%';
    return `${Math.round((record.wins / total) * 100)}%`;
  }

  netPoints(record: HeadToHeadRecord): string {
    const net = record.pointsWon - record.pointsLost;
    return net >= 0 ? `+${net}` : `${net}`;
  }

  prev(): void {
    if (!this.isPrevDisabled()) this.pageChange.emit(this.matchPageIndex() - 1);
  }

  next(): void {
    if (!this.isNextDisabled()) this.pageChange.emit(this.matchPageIndex() + 1);
  }
}
