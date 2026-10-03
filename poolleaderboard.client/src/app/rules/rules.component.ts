import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbCardModule } from '@nebular/theme';

export type RackBall = 'red' | 'yellow' | 'black';

@Component({
  selector: 'app-rules',
  imports: [NbCardModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent {
  /** Our racking, rows ordered from the front (apex) of the triangle to the back. */
  readonly rack: RackBall[][] = [
    ['yellow'],
    ['yellow', 'red'],
    ['red', 'black', 'yellow'],
    ['yellow', 'red', 'yellow', 'red'],
    ['red', 'yellow', 'red', 'red', 'yellow'],
  ];
}
