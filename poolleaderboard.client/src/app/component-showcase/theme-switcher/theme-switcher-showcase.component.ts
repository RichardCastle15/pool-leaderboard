import { Component } from '@angular/core';
import { AppTheme } from '../../core/services/theme.service';
import { ThemeSwitcherComponent } from '../../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-theme-switcher-showcase',
  standalone: true,
  imports: [ThemeSwitcherComponent],
  template: `<app-theme-switcher [selectedTheme]="selected" (themeChange)="selected = $event"></app-theme-switcher>`
})
export class ThemeSwitcherShowcaseComponent {
  selected: AppTheme = 'default';
}
