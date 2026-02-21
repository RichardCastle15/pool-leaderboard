import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { Subscription } from 'rxjs';
import { LeaderboardService } from '../services/leaderboard.service';
import { HubConnection } from '@microsoft/signalr';

@Component({
  selector: 'app-leaderboard-container',
  imports: [LeaderboardComponent],
  templateUrl: './leaderboard-container.component.html',
  styleUrl: './leaderboard-container.component.scss'
})
export class LeaderboardContainerComponent implements OnInit, OnDestroy {
  loading = signal(true);
  data = signal<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  private subscription = new Subscription();
  private hubConnection: HubConnection | undefined;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    const sub = this.leaderboardService.leaderboard$.subscribe(entries => {
      this.loading.set(false);
      this.data.set(entries);
    });
    this.hubConnection = this.leaderboardService.connect();
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hubConnection?.stop();
  }

  addParticipant(name: string): void {
    const addSub = this.leaderboardService.addParticipant(name).subscribe();
    this.subscription.add(addSub);
  }
}
