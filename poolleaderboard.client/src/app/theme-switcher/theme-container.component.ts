import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbCardModule } from '@nebular/theme';
import { ThemeService } from '../core/services/theme.service';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@Component({
  selector: 'app-theme-container',
  standalone: true,
  imports: [NbCardModule, ThemeSwitcherComponent],
  template: `
    <nb-card>
      <nb-card-header>Theme</nb-card-header>
      <nb-card-body>
        <app-theme-switcher
          [selectedTheme]="themeService.currentTheme()"
          (themeChange)="themeService.setTheme($event)">
        </app-theme-switcher>
      </nb-card-body>
    </nb-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeContainerComponent {
  constructor(protected themeService: ThemeService) {}
}
