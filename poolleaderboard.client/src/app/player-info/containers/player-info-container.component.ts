import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HubConnection } from '@microsoft/signalr';
import { Subscription } from 'rxjs';
import { NbToastrService } from '@nebular/theme';
import { LeaderboardEntryRow } from '../../leaderboard/models/leaderboard-entry-row.model';
import { LeaderboardService } from '../../leaderboard/services/leaderboard.service';
import { MatchHistoryRow } from '../../match-history/models/match-history.model';
import { HeadToHeadRecord } from '../models/player-info.model';
import { PlayerInfoService } from '../services/player-info.service';
import { PlayerInfoComponent } from '../presenters/player-info.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-player-info-container',
  imports: [PlayerInfoComponent],
  template: `
    <app-player-info
      [playerName]="playerName()"
      [matchEntries]="matchEntries()"
      [matchLoading]="matchLoading()"
      [matchPageIndex]="matchPageIndex()"
      [matchPageSize]="pageSize"
      [matchTotal]="matchTotal()"
      [headToHead]="headToHead()"
      [headToHeadLoading]="headToHeadLoading()"
      (pageChange)="loadPage($event)">
    </app-player-info>
  `
})
export class PlayerInfoContainerComponent implements OnInit, OnDestroy {
  readonly pageSize = PAGE_SIZE;

  playerName = signal('');
  matchEntries = signal<MatchHistoryRow[]>([]);
  matchTotal = signal(0);
  matchPageIndex = signal(0);
  matchLoading = signal(true);
  headToHead = signal<HeadToHeadRecord[]>([]);
  headToHeadLoading = signal(true);

  private playerId = 0;
  private subscription = new Subscription();
  private hubConnection: HubConnection | undefined;

  constructor(
    private route: ActivatedRoute,
    private playerInfoService: PlayerInfoService,
    private leaderboardService: LeaderboardService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.playerId = Number(this.route.snapshot.paramMap.get('id'));

    const leaderboardSub = this.leaderboardService.leaderboard$.subscribe(entries => {
      const match = entries.map(e => e.data as LeaderboardEntryRow).find(e => e.id === this.playerId);
      if (match) this.playerName.set(match.name);
    });
    this.hubConnection = this.leaderboardService.connect();
    this.subscription.add(leaderboardSub);

    this.loadPage(0);
    this.loadHeadToHead();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hubConnection?.stop();
  }

  loadPage(pageIndex: number): void {
    this.matchLoading.set(true);
    this.matchPageIndex.set(pageIndex);
    const sub = this.playerInfoService.getPlayerMatches(this.playerId, pageIndex * this.pageSize, this.pageSize).subscribe({
      next: page => {
        this.matchEntries.set(page.items);
        this.matchTotal.set(page.total);
        this.matchLoading.set(false);
      },
      error: () => {
        this.matchLoading.set(false);
        this.toastrService.danger('Failed to load match history', 'Error');
      }
    });
    this.subscription.add(sub);
  }

  private loadHeadToHead(): void {
    const sub = this.playerInfoService.getHeadToHead(this.playerId).subscribe({
      next: records => {
        this.headToHead.set(records);
        this.headToHeadLoading.set(false);
      },
      error: () => {
        this.headToHeadLoading.set(false);
        this.toastrService.danger('Failed to load head-to-head records', 'Error');
      }
    });
    this.subscription.add(sub);
  }
}
