import { Component } from '@angular/core';
import { KillerComponent } from '../../killer/killer.component';
import { KillerGame } from '../../killer/types/killer-game.model';

@Component({
  selector: 'app-disconnected-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [game]="game" [isActive]="true" [disconnected]="true"></app-killer>
  `,
  styles: ``
})
export class DisconnectedKillerShowcaseComponent {
  game: KillerGame = {
    currentPlayerIndex: 1,
    playerRows: [
      { name: 'Richard', livesRemaining: 3 },
      { name: 'Russel', livesRemaining: 2 },
      { name: 'Rob P', livesRemaining: 3 },
      { name: 'Cavan', livesRemaining: 1 },
    ]
  };
}
