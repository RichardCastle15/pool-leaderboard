import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-compact-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game" [size]="'compact'"></app-killer>
  `,
  styles: ``
})
export class CompactKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 0,
    playerRows: [
      {name: 'Richard', livesRemaining: 3},
      {name: 'Russel', livesRemaining: 3},
      {name: 'Rob P', livesRemaining: 3},
      {name: 'Cavan', livesRemaining: 3},
      {name: 'Liam', livesRemaining: 3},
    ]
  }
}
