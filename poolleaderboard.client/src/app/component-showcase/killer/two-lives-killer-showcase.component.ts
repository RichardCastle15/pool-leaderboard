import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-two-lives-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game"></app-killer>
  `,
  styles: ``
})
export class TwoLivesKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 0,
    playerRows: [
      {name: 'Richard', livesRemaining: 2},
      {name: 'Russel', livesRemaining: 2},
      {name: 'Rob P', livesRemaining: 2},
      {name: 'Cavan', livesRemaining: 2},
      {name: 'Liam', livesRemaining: 2},
    ]
  }
}
