import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbOptionModule, NbSelectModule } from '@nebular/theme';
import { AppTheme } from '../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [NbSelectModule, NbOptionModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  @Input({ required: true }) selectedTheme!: AppTheme;
  @Output() themeChange = new EventEmitter<AppTheme>();
}
