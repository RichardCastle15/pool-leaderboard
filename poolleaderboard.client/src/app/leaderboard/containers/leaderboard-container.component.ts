import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { finalize, Subscription } from 'rxjs';
import { LeaderboardService } from '../services/leaderboard.service';
import { KillerService } from '../../killer/killer.service';
import { HubConnection } from '@microsoft/signalr';
import { NbToastrService } from '@nebular/theme';
import { ViewportSizeService } from '../../core/services/viewport-size.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LeaderboardAction } from '../models/leaderboard-action.model';

@Component({
  selector: 'app-leaderboard-container',
  imports: [LeaderboardComponent],
  templateUrl: './leaderboard-container.component.html',
  styleUrl: './leaderboard-container.component.scss'
})
export class LeaderboardContainerComponent implements OnInit, OnDestroy {
  loading = signal(true);
  data = signal<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  /** The request currently in flight, if any. Further actions are ignored until it settles. */
  pendingAction = signal<LeaderboardAction | null>(null);
  private subscription = new Subscription();
  private hubConnection: HubConnection | undefined;

  constructor(
    private leaderboardService: LeaderboardService,
    private killerService: KillerService,
    private router: Router,
    private toastrService: NbToastrService,
    protected viewport: ViewportSizeService
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
    if (!this.beginAction('addParticipant'))
      return;
    const addSub = this.leaderboardService.addParticipant(name).pipe(this.endAction()).subscribe({
      error: (err: HttpErrorResponse) => {
        const message = err.status === 409 && typeof err.error === 'string'
          ? err.error
          : 'Failed to add participant';
        this.toastrService.danger(message, 'Error');
      }
    });
    this.subscription.add(addSub);
  }

  startKiller(players: { id: number; name: string }[]): void {
    if (!this.beginAction('startKiller'))
      return;
    // Stay pending until the killer page has loaded, not just until the game is created: the lazy-loaded
    // route can take seconds on a slow connection and the button shouldn't look idle in the meantime.
    const sub = this.killerService.startGame(players).subscribe({
      next: () => this.router.navigate(['/killer']).finally(() => this.pendingAction.set(null)),
      error: () => {
        this.pendingAction.set(null);
        this.toastrService.danger('Failed to start killer game', 'Error');
      }
    });
    this.subscription.add(sub);
  }

  recordResult({ winnerId, loserId }: { winnerId: number; loserId: number }): void {
    if (!this.beginAction('recordResult'))
      return;
    const sub = this.leaderboardService.recordResult(winnerId, loserId).pipe(this.endAction()).subscribe({
      error: () => this.toastrService.danger('Failed to record result', 'Error')
    });
    this.subscription.add(sub);
  }

  private beginAction(action: LeaderboardAction): boolean {
    if (this.pendingAction())
      return false;
    this.pendingAction.set(action);
    return true;
  }

  private endAction<T>() {
    return finalize<T>(() => this.pendingAction.set(null));
  }
}
