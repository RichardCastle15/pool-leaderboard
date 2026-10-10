import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ReplaceKillerDialogComponent } from '../../leaderboard/presenters/replace-killer-dialog/replace-killer-dialog.component';

/** The dialog normally lives in an overlay; here it is rendered inline with a no-op NbDialogRef. */
@Component({
  selector: 'app-replace-killer-dialog-showcase',
  imports: [ReplaceKillerDialogComponent],
  providers: [{ provide: NbDialogRef, useValue: { close: () => {} } }],
  template: `
    <h5>With players</h5>
    <app-replace-killer-dialog [playerNames]="players"></app-replace-killer-dialog>
    <h5>Finished game, result not recorded</h5>
    <app-replace-killer-dialog [playerNames]="players" [winner]="players[1]"></app-replace-killer-dialog>
    <h5>Players unknown</h5>
    <app-replace-killer-dialog></app-replace-killer-dialog>
  `,
  styles: ``
})
export class ReplaceKillerDialogShowcaseComponent {
  players = ['Richard', 'Russel', 'Stephen B'];
}
