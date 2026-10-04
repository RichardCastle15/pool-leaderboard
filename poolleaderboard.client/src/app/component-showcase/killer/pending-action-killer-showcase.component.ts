import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-pending-action-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game" pendingAction="pot"></app-killer>
  `,
  styles: ``
})
export class PendingActionKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 1,
    playerRows: [
      {name: 'Richard', livesRemaining: 3},
      {name: 'Russel', livesRemaining: 2},
      {name: 'Rob P', livesRemaining: 3},
      {name: 'Cavan', livesRemaining: 1},
    ]
  }
}
