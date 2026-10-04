import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { HubConnection } from '@microsoft/signalr';
import { NbToastrService } from '@nebular/theme';
import { KillerComponent } from './killer.component';
import { KillerService } from './killer.service';
import { KillerGame } from './types/killer-game.model';
import { ViewportSizeService } from '../core/services/viewport-size.service';
import { KillerAction } from './types/killer-action.model';

@Component({
  selector: 'app-killer-container',
  imports: [KillerComponent],
  templateUrl: './killer-container.component.html',
})
export class KillerContainerComponent implements OnInit, OnDestroy {
  game = signal<KillerGame | undefined>(undefined);
  isActive = signal(false);
  /** True until the hub sends the first game state (it does so on connect), so we don't flash "No active game". */
  loading = signal(true);
  disconnected = signal(false);
  /** The request currently in flight, if any. Further actions are ignored until it settles. */
  pendingAction = signal<KillerAction | null>(null);

  private hubConnection: HubConnection | undefined;
  private subscription = new Subscription();

  constructor(
    private killerService: KillerService,
    private router: Router,
    private toastrService: NbToastrService,
    protected viewport: ViewportSizeService
  ) {}

  ngOnInit(): void {
    this.hubConnection = this.killerService.connect();

    const gameSub = this.killerService.game$.subscribe(state => {
      this.loading.set(false);
      this.isActive.set(state.isActive);
      if (state.isActive) {
        this.game.set(KillerService.toKillerGame(state));
      }
    });

    const endedSub = this.killerService.gameEnded$.subscribe(() => {
      this.router.navigate(['/leaderboard']);
    });

    const errorSub = this.killerService.error$.subscribe(message => {
      this.loading.set(false);
      this.toastrService.danger(message, 'Error');
    });

    const disconnectedSub = this.killerService.disconnected$.subscribe(isDisconnected => {
      this.disconnected.set(isDisconnected);
    });

    this.subscription.add(gameSub);
    this.subscription.add(endedSub);
    this.subscription.add(errorSub);
    this.subscription.add(disconnectedSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hubConnection?.stop();
  }

  onPot(): void { this.invokeHub('pot', () => this.killerService.pot()); }
  onMiss(): void { this.invokeHub('miss', () => this.killerService.miss()); }
  onEarlyBlackPot(): void { this.invokeHub('earlyBlackPot', () => this.killerService.earlyBlackPot()); }
  onUndo(): void { this.invokeHub('undo', () => this.killerService.undo()); }
  onAbandon(): void { this.invokeHub('abandon', () => this.killerService.abandon()); }

  onConfirmEnd(): void {
    if (!this.beginAction('confirmEnd'))
      return;
    const sub = this.killerService.confirmEnd().pipe(finalize(() => this.pendingAction.set(null))).subscribe({
      error: () => this.toastrService.danger('Failed to confirm game end', 'Error')
    });
    this.subscription.add(sub);
  }

  private invokeHub(action: KillerAction, invoke: () => Promise<void>): void {
    if (!this.beginAction(action))
      return;
    invoke().finally(() => this.pendingAction.set(null));
  }

  private beginAction(action: KillerAction): boolean {
    if (this.pendingAction())
      return false;
    this.pendingAction.set(action);
    return true;
  }
}
