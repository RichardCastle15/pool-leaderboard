import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { Subscription } from 'rxjs';
import { LeaderboardService } from '../services/leaderboard.service';
import { KillerService } from '../../killer/killer.service';
import { HubConnection } from '@microsoft/signalr';
import { NbToastrService } from '@nebular/theme';

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

  constructor(
    private leaderboardService: LeaderboardService,
    private killerService: KillerService,
    private router: Router,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    const sub = this.leaderboardService.leaderboard$.subscribe(entries => {
      this.loading.set(false);
      this.data.set(entries);
    });
    const errorSub = this.leaderboardService.error$.subscribe(message => {
      this.loading.set(false);
      this.toastrService.danger(message, 'Error');
    });
    this.hubConnection = this.leaderboardService.connect();
    this.subscription.add(sub);
    this.subscription.add(errorSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hubConnection?.stop();
  }

  addParticipant(name: string): void {
    const addSub = this.leaderboardService.addParticipant(name).subscribe({
      error: () => this.toastrService.danger('Failed to add participant', 'Error')
    });
    this.subscription.add(addSub);
  }

  startKiller(players: { id: number; name: string }[]): void {
    const sub = this.killerService.startGame(players).subscribe({
      next: () => this.router.navigate(['/killer']),
      error: () => this.toastrService.danger('Failed to start killer game', 'Error')
    });
    this.subscription.add(sub);
  }
}
