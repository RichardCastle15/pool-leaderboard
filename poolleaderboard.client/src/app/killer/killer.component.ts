import { Component, computed, input, OnDestroy, output, Signal } from '@angular/core';
import { KillerGame } from './types/killer-game.model';
import { TreeNode } from '../leaderboard/models/tree-node.model';
import { KillerGameRow } from './types/killer-game-row.model';
import { NbActionsModule, NbAlertModule, NbButtonModule, NbCardModule, NbDialogService, NbTreeGridModule } from "@nebular/theme";
import { Subscription } from 'rxjs';
import { AbandonKillerDialogComponent } from './abandon-killer-dialog/abandon-killer-dialog.component';

@Component({
  selector: 'app-killer',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule, NbAlertModule, NbButtonModule],
  templateUrl: './killer.component.html',
  styleUrl: './killer.component.scss'
})
export class KillerComponent implements OnDestroy {
  readonly columns = ['name', 'livesRemaining'];

  game = input<KillerGame>();
  size = input<'full'|'compact'>('full');
  disconnected = input(false);
  isActive = input(true);

  pot = output();
  miss = output();
  earlyBlackPot = output();
  undo = output();
  abandon = output();
  confirmEnd = output();

  tableData: Signal<TreeNode<KillerGameRow>[] | undefined>;

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
    const dialogRef = this.dialogService.open(AbandonKillerDialogComponent);
    const sub = dialogRef.onClose.subscribe((confirmed: boolean | undefined) => {
      if (confirmed) this.abandon.emit();
    });
    this.subscriptions.add(sub);
  }
}
