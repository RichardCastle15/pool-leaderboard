import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbDialogRef, NbInputModule } from '@nebular/theme';

function fullNameValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  // Requires at least one non-whitespace character, a space, then at least one more non-whitespace character.
  return /^[^\s]+\s+\S.*$/.test(value.trim()) ? null : { fullName: true };
}

@Component({
  selector: 'app-new-participant',
  imports: [NbCardModule, NbInputModule, NbButtonModule, ReactiveFormsModule],
  templateUrl: './new-participant.component.html',
  styleUrl: './new-participant.component.scss'
})
export class NewParticipantComponent {
  nameControl = new FormControl('', [Validators.required, fullNameValidator]);

  constructor(private readonly dialogRef: NbDialogRef<NewParticipantComponent>) {}

  cancelDialog() {
    this.dialogRef.close();
  }

  submitDialog() {
    if (this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      return;
    }
    this.dialogRef.close(this.nameControl.value);
  }
}
