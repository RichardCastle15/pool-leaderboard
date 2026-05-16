import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-abandon-killer-dialog',
  imports: [NbCardModule, NbButtonModule],
  templateUrl: './abandon-killer-dialog.component.html',
  styleUrl: './abandon-killer-dialog.component.scss'
})
export class AbandonKillerDialogComponent {
  constructor(private readonly dialogRef: NbDialogRef<AbandonKillerDialogComponent>) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
