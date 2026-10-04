import { Component, computed, input, OnDestroy, output, Signal } from '@angular/core';
import { KillerGame } from './types/killer-game.model';
import { TreeNode } from '../leaderboard/models/tree-node.model';
import { KillerGameRow } from './types/killer-game-row.model';
import { NbActionsModule, NbAlertModule, NbButtonModule, NbCardModule, NbDialogService, NbSpinnerModule, NbTreeGridModule } from "@nebular/theme";
import { Subscription } from 'rxjs';
import { AbandonKillerDialogComponent } from './abandon-killer-dialog/abandon-killer-dialog.component';
import { KillerAction } from './types/killer-action.model';

@Component({
  selector: 'app-killer',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbAlertModule, NbButtonModule, NbSpinnerModule],
  templateUrl: './killer.component.html',
  styleUrl: './killer.component.scss'
})
export class KillerComponent implements OnDestroy {
  readonly columns = ['name', 'livesRemaining'];

  game = input<KillerGame>();
  size = input<'full'|'compact'>('full');
  disconnected = input(false);
  isActive = input(true);
  pendingAction = input<KillerAction | null>(null);

  pot = output();
  miss = output();
  earlyBlackPot = output();
  undo = output();
  abandon = output();
  confirmEnd = output();

  tableData: Signal<TreeNode<KillerGameRow>[] | undefined>;

  /**
   * Once someone has won, only Undo, Abandon and Confirm end make sense. nb-action's `disabled` is styling only
   * and still lets clicks through, so the shot actions also check this before emitting.
   */
  gameOver = computed(() => !!this.game()?.winner);

  /** While a request is in flight every action is blocked, so a double-tap can't pot (or undo) twice. */
  busy = computed(() => !!this.pendingAction());
  shotsDisabled = computed(() => this.gameOver() || this.busy());

  private subscriptions = new Subscription();

  constructor(private readonly dialogService: NbDialogService) {
    this.tableData = computed(() => {
      const gameData = this.game();
      if (!gameData)
        return undefined;
      return gameData.playerRows.map(pr => ({ data: pr }));
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  times(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  onAbandonClick(): void {
    if (this.busy())
      return;
    const dialogRef = this.dialogService.open(AbandonKillerDialogComponent);
    const sub = dialogRef.onClose.subscribe((confirmed: boolean | undefined) => {
      if (confirmed) this.abandon.emit();
    });
    this.subscriptions.add(sub);
  }
}
