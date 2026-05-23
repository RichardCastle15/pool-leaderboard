import { Injectable, signal } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

export type AppTheme = 'default' | 'dark' | 'cosmic';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'theme';

  readonly currentTheme = signal<AppTheme>(this.loadFromStorage());

  constructor(private nbThemeService: NbThemeService) {
    this.nbThemeService.changeTheme(this.currentTheme());
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    this.nbThemeService.changeTheme(theme);
    localStorage.setItem(ThemeService.STORAGE_KEY, theme);
  }

  private loadFromStorage(): AppTheme {
    const stored = localStorage.getItem(ThemeService.STORAGE_KEY);
    if (stored === 'default' || stored === 'dark' || stored === 'cosmic')
      return stored;
    return 'default';
  }
}
