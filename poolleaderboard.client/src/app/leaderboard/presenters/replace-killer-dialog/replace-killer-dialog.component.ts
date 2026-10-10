import { Component, Input } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-replace-killer-dialog',
  imports: [NbCardModule, NbButtonModule],
  templateUrl: './replace-killer-dialog.component.html',
  styleUrl: './replace-killer-dialog.component.scss'
})
export class ReplaceKillerDialogComponent {
  // Set by NbDialogService context. Empty when the server didn't say who is playing.
  @Input() playerNames: string[] = [];

  constructor(private readonly dialogRef: NbDialogRef<ReplaceKillerDialogComponent>) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
