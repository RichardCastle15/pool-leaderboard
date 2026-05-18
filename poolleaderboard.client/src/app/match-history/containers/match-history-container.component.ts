import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { NbToastrService } from '@nebular/theme';
import { MatchHistoryRow } from '../models/match-history.model';
import { MatchHistoryService } from '../services/match-history.service';
import { MatchHistoryComponent } from '../presenters/match-history.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-match-history-container',
  imports: [MatchHistoryComponent],
  templateUrl: './match-history-container.component.html'
})
export class MatchHistoryContainerComponent implements OnInit, OnDestroy {
  readonly pageSize = PAGE_SIZE;
  loading = signal(true);
  entries = signal<MatchHistoryRow[]>([]);
  total = signal(0);
  pageIndex = signal(0);

  private subscription = new Subscription();

  constructor(
    private matchHistoryService: MatchHistoryService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPage(pageIndex: number): void {
    this.loading.set(true);
    this.pageIndex.set(pageIndex);
    const sub = this.matchHistoryService.getPage(pageIndex * this.pageSize, this.pageSize).subscribe({
      next: page => {
        this.entries.set(page.items);
        this.total.set(page.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastrService.danger('Failed to load match history', 'Error');
      }
    });
    this.subscription.add(sub);
  }
}
