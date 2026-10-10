import { Component, Input } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogRef } from '@nebular/theme';

/** What the user chose: start the new game anyway, go and deal with the existing one, or do nothing. */
export type ReplaceKillerDialogResult = 'replace' | 'viewGame' | 'cancel';

@Component({
  selector: 'app-replace-killer-dialog',
  imports: [NbCardModule, NbButtonModule],
  templateUrl: './replace-killer-dialog.component.html',
  styleUrl: './replace-killer-dialog.component.scss'
})
export class ReplaceKillerDialogComponent {
  // Set by NbDialogService context. Empty when the server didn't say who is playing.
  @Input() playerNames: string[] = [];
  /** Set when the game in progress has already been won but its result hasn't been confirmed. */
  @Input() winner?: string;

  constructor(private readonly dialogRef: NbDialogRef<ReplaceKillerDialogComponent>) {}

  replace(): void {
    this.dialogRef.close('replace');
  }

  viewGame(): void {
    this.dialogRef.close('viewGame');
  }

  cancel(): void {
    this.dialogRef.close('cancel');
  }
}
