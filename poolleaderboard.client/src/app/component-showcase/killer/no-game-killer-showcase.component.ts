import { Component } from '@angular/core';
import { KillerComponent } from '../../killer/killer.component';

@Component({
  selector: 'app-no-game-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [isActive]="false"></app-killer>
  `,
  styles: ``
})
export class NoGameKillerShowcaseComponent {}
