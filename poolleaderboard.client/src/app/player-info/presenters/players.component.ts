import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbCardModule, NbListModule, NbSpinnerModule } from '@nebular/theme';
import { LeaderboardEntryRow } from '../../leaderboard/models/leaderboard-entry-row.model';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
  imports: [NbCardModule, NbListModule, NbSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayersComponent {
  players = input<LeaderboardEntryRow[]>([]);
  loading = input(false);
}
