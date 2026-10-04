import { Component } from '@angular/core';
import { KillerComponent } from "../../killer/killer.component";

@Component({
  selector: 'app-loading-killer-showcase',
  imports: [KillerComponent],
  template: `
    <app-killer [loading]="true"></app-killer>
  `,
  styles: ``
})
export class LoadingKillerShowcaseComponent {}
