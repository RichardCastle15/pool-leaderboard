import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-long-list-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class LongListKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 0,
    playerRows: [
      {name: 'Richard', livesRemaining: 3},
      {name: 'Russel', livesRemaining: 3},
      {name: 'Rob P', livesRemaining: 3},
      {name: 'Cavan', livesRemaining: 3},
      {name: 'Liam', livesRemaining: 3},
      {name: 'Stephen B', livesRemaining: 3},
      {name: 'Stephen G', livesRemaining: 3},
      {name: 'Sath', livesRemaining: 3},
      {name: 'James S', livesRemaining: 0, eliminated: true},
      {name: 'Mohsen', livesRemaining: 3},
      {name: 'Richard B', livesRemaining: 3},
    ]
  }
}
