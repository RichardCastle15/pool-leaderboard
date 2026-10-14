import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NbIconModule } from '@nebular/theme';
import { AppTheme } from '../core/services/theme.service';

interface ThemeOption {
  value: AppTheme;
  label: string;
  /** Preview colours are deliberately fixed so each option always shows its own theme. */
  background: string;
  surface: string;
  text: string;
  accent: string;
}

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [NbIconModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  @Input({ required: true }) selectedTheme!: AppTheme;
  @Output() themeChange = new EventEmitter<AppTheme>();

  readonly options: ThemeOption[] = [
    { value: 'default', label: 'Light', background: '#edf1f7', surface: '#ffffff', text: '#222b45', accent: '#3366ff' },
    { value: 'dark', label: 'Dark', background: '#151a30', surface: '#222b45', text: '#ffffff', accent: '#3366ff' },
    { value: 'cosmic', label: 'Cosmic', background: '#2f296b', surface: '#3d3780', text: '#ffffff', accent: '#a16eff' },
  ];
}
