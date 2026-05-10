import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogRef } from '@nebular/theme';
import { computeEloDelta } from '../../services/elo';

export interface RecordResultDialogPlayer {
  id: number;
  name: string;
  rating: number;
}

export interface RecordResultDialogResult {
  winnerId: number;
  loserId: number;
}

@Component({
  selector: 'app-record-result-dialog',
  imports: [NbCardModule, NbButtonModule],
  templateUrl: './record-result-dialog.component.html',
  styleUrl: './record-result-dialog.component.scss'
})
export class RecordResultDialogComponent {
  // Set by NbDialogService context.
  playerA!: RecordResultDialogPlayer;
  playerB!: RecordResultDialogPlayer;

  constructor(private readonly dialogRef: NbDialogRef<RecordResultDialogComponent>) {}

  get aWinSwing(): number {
    return computeEloDelta(this.playerA.rating, this.playerB.rating);
  }

  get bWinSwing(): number {
    return computeEloDelta(this.playerB.rating, this.playerA.rating);
  }

  pickWinner(winner: RecordResultDialogPlayer, loser: RecordResultDialogPlayer): void {
    const result: RecordResultDialogResult = { winnerId: winner.id, loserId: loser.id };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
