import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NbButtonModule, NbCardModule, NbIconModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { KillerMatchRow, MatchHistoryRow, OneVsOneMatchRow } from '../models/match-history.model';

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.scss',
  imports: [DatePipe, NbCardModule, NbListModule, NbButtonModule, NbIconModule, NbSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchHistoryComponent {
  entries = input<MatchHistoryRow[]>([]);
  loading = input(false);
  pageIndex = input(0);
  pageSize = input(10);
  total = input(0);

  pageChange = output<number>();

  pageLabel = computed(() => {
    const totalPages = Math.max(1, Math.ceil(this.total() / this.pageSize()));
    return `Page ${this.pageIndex() + 1} of ${totalPages}`;
  });

  isPrevDisabled = computed(() => this.pageIndex() === 0);
  isNextDisabled = computed(
    () => (this.pageIndex() + 1) * this.pageSize() >= this.total()
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

  prev(): void {
    if (!this.isPrevDisabled()) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }

  next(): void {
    if (!this.isNextDisabled()) {
      this.pageChange.emit(this.pageIndex() + 1);
    }
  }
}
