import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-game-won-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class GameWonKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 3,
    playerRows: [
      {name: 'Richard', livesRemaining: 0, eliminated: true},
      {name: 'Russel', livesRemaining: 0, eliminated: true},
      {name: 'Rob P', livesRemaining: 0, eliminated: true},
      {name: 'Cavan', livesRemaining: 2},
    ],
    winner: 'Cavan'
  }
}
