import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'app-rules',
  imports: [NbCardModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent {}
