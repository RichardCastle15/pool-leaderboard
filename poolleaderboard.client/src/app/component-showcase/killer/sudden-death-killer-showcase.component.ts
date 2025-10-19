import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-sudden-death-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class SuddenDeathKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 4,
    playerRows: [
      {name: 'Richard', livesRemaining: 1, missedInSuddenDeath: true},
      {name: 'Russel', livesRemaining: 0, eliminated: true},
      {name: 'Rob P', livesRemaining: 0, eliminated: true},
      {name: 'Cavan', livesRemaining: 1, missedInSuddenDeath: true},
      {name: 'Liam', livesRemaining: 1},
    ]
  }
}
