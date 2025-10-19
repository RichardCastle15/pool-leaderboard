import { Component, computed, input, Signal } from '@angular/core';
import { KillerGame } from './types/killer-game.model';
import { TreeNode } from '../leaderboard/tree-node.model';
import { KillerGameRow } from './types/killer-game-row.model';
import { NbActionsModule, NbCardModule, NbTreeGridModule } from "@nebular/theme";

@Component({
  selector: 'app-killer',
  imports: [NbTreeGridModule, NbCardModule, NbActionsModule],
  templateUrl: './killer.component.html',
  styleUrl: './killer.component.scss'
})
export class KillerComponent {
  readonly columns = ['name', 'livesRemaining'];

  game = input<KillerGame>();
  size = input<'full'|'compact'>('full');

  tableData: Signal<TreeNode<KillerGameRow>[] | undefined>;

  constructor() {
    this.tableData = computed(() => {
      const gameData = this.game();
      if (!gameData)
        return undefined;
      return gameData.playerRows.map(pr => ({ data: pr }));
    })
  }

  times(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
