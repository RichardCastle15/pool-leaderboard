import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Subscription } from 'rxjs';
import { LeaderboardEntryRow } from '../../leaderboard/models/leaderboard-entry-row.model';
import { LeaderboardService } from '../../leaderboard/services/leaderboard.service';
import { PlayersComponent } from '../presenters/players.component';

@Component({
  selector: 'app-players-container',
  imports: [PlayersComponent],
  template: `<app-players [players]="players()" [loading]="loading()"></app-players>`
})
export class PlayersContainerComponent implements OnInit, OnDestroy {
  loading = signal(true);
  players = signal<LeaderboardEntryRow[]>([]);

  private subscription = new Subscription();
  private hubConnection: HubConnection | undefined;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    const sub = this.leaderboardService.leaderboard$.subscribe(entries => {
      this.loading.set(false);
      this.players.set(entries.map(e => e.data as LeaderboardEntryRow).filter(e => !!e.id));
    });
    this.hubConnection = this.leaderboardService.connect();
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hubConnection?.stop();
  }
}
