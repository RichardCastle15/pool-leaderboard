import { Component, input } from '@angular/core';
import { KillerGame } from './types/killer-game.model';

@Component({
  selector: 'app-killer',
  imports: [],
  templateUrl: './killer.component.html',
  styleUrl: './killer.component.scss'
})
export class KillerComponent {
  game = input<KillerGame>();
}
