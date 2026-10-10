import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { finalize, Subscription } from 'rxjs';
import { LeaderboardService } from '../services/leaderboard.service';
import { KillerGameInProgressResponse, KillerService } from '../../killer/killer.service';
import { HubConnection } from '@microsoft/signalr';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ViewportSizeService } from '../../core/services/viewport-size.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LeaderboardAction } from '../models/leaderboard-action.model';
import { ReplaceKillerDialogComponent, ReplaceKillerDialogResult } from '../presenters/replace-killer-dialog/replace-killer-dialog.component';

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
    private dialogService: NbDialogService,
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
    this.postStartKiller(players, false);
  }

  private postStartKiller(players: { id: number; name: string }[], replaceExisting: boolean): void {
    // Stay pending until the killer page has loaded, not just until the game is created: the lazy-loaded
    // route can take seconds on a slow connection and the button shouldn't look idle in the meantime.
    const sub = this.killerService.startGame(players, replaceExisting).subscribe({
      next: () => this.router.navigate(['/killer']).finally(() => this.pendingAction.set(null)),
      error: (err: HttpErrorResponse) => {
        this.pendingAction.set(null);
        if (err.status === 409 && !replaceExisting) {
          // The server owns whether a game is in progress (another device may have started it), so we only
          // find out by asking. Nothing has changed server-side; let the user decide.
          const body = err.error as Partial<KillerGameInProgressResponse> | null;
          this.confirmReplaceKiller(players, Array.isArray(body?.players) ? body.players : [], body?.winner ?? undefined);
          return;
        }
        this.toastrService.danger('Failed to start killer game', 'Error');
      }
    });
    this.subscription.add(sub);
  }

  private confirmReplaceKiller(players: { id: number; name: string }[], existingPlayerNames: string[], winner?: string): void {
    const dialogRef = this.dialogService.open(ReplaceKillerDialogComponent, {
      context: { playerNames: existingPlayerNames, winner }
    });
    const sub = dialogRef.onClose.subscribe((result: ReplaceKillerDialogResult | undefined) => {
      if (result === 'replace' && this.beginAction('startKiller'))
        this.postStartKiller(players, true);
      else if (result === 'viewGame')
        this.router.navigate(['/killer']);
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
