import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbDialogRef, NbInputModule } from '@nebular/theme';

@Component({
  selector: 'app-new-participant',
  imports: [NbCardModule, NbInputModule, NbButtonModule, FormsModule],
  templateUrl: './new-participant.component.html',
  styleUrl: './new-participant.component.scss'
})
export class NewParticipantComponent {
  suppliedName = model('');

  constructor(private readonly dialogRef: NbDialogRef<NewParticipantComponent>) {}

  cancelDialog() {
    this.dialogRef.close();
  }

  submitDialog() {
    this.dialogRef.close(this.suppliedName());
  }
}
