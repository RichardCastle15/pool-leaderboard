import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HubConnection } from '@microsoft/signalr';
import { NbToastrService } from '@nebular/theme';
import { KillerComponent } from './killer.component';
import { KillerService } from './killer.service';
import { KillerGame } from './types/killer-game.model';
import { ViewportSizeService } from '../core/services/viewport-size.service';

@Component({
  selector: 'app-killer-container',
  imports: [KillerComponent],
  templateUrl: './killer-container.component.html',
})
export class KillerContainerComponent implements OnInit, OnDestroy {
  game = signal<KillerGame | undefined>(undefined);
  isActive = signal(false);
  disconnected = signal(false);

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
      this.isActive.set(state.isActive);
      if (state.isActive) {
        this.game.set(KillerService.toKillerGame(state));
      }
    });

    const endedSub = this.killerService.gameEnded$.subscribe(() => {
      this.router.navigate(['/leaderboard']);
    });

    const errorSub = this.killerService.error$.subscribe(message => {
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

  onPot(): void { this.killerService.pot(); }
  onMiss(): void { this.killerService.miss(); }
  onEarlyBlackPot(): void { this.killerService.earlyBlackPot(); }
  onUndo(): void { this.killerService.undo(); }
  onAbandon(): void { this.killerService.abandon(); }

  onConfirmEnd(): void {
    const sub = this.killerService.confirmEnd().subscribe({
      error: () => this.toastrService.danger('Failed to confirm game end', 'Error')
    });
    this.subscription.add(sub);
  }
}
