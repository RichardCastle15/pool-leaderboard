import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NbCardModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { LeaderboardEntryRow } from '../../leaderboard/models/leaderboard-entry-row.model';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
  imports: [NbCardModule, NbListModule, NbSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayersComponent {
  players = input<LeaderboardEntryRow[]>([]);
  loading = input(false);

  playerSelected = output<number>();
}
