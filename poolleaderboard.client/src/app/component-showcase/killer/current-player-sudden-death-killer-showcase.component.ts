import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

/** The highlighted (current) row with lost lives and with the sudden-death miss face, to check contrast on the highlight. */
@Component({
  selector: 'app-current-player-sudden-death-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class CurrentPlayerSuddenDeathKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 2,
    playerRows: [
      {name: 'Richard', livesRemaining: 0, eliminated: true},
      {name: 'Russel', livesRemaining: 1, missedInSuddenDeath: true},
      {name: 'Cavan', livesRemaining: 1, missedInSuddenDeath: true},
      {name: 'Liam', livesRemaining: 1},
    ]
  }
}
