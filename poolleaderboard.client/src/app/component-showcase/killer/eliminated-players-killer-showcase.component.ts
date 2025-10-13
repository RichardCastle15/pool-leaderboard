import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-eliminated-players-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class EliminatedPlayersKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 1,
    playerRows: [
      {name: 'Richard', livesRemaining: 0, eliminated: true},
      {name: 'Russel', livesRemaining: 2},
      {name: 'Rob P', livesRemaining: 2},
      {name: 'James S', livesRemaining: 0, eliminated: true},
      {name: 'Cavan', livesRemaining: 2},
      {name: 'Liam', livesRemaining: 2},
    ]
  }
}
