import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";

@Component({
  selector: 'app-new-game-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer></app-killer>
  `,
  styles: ``
})
export class NewGameKillerShowcaseComponent {

}
