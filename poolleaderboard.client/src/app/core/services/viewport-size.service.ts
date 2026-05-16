import { Injectable, signal } from '@angular/core';
import { NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

export type ViewportSize = 'full' | 'compact';

@Injectable({ providedIn: 'root' })
export class ViewportSizeService {
  readonly size = signal<ViewportSize>('full');

  constructor(theme: NbThemeService, breakpoints: NbMediaBreakpointsService) {
    const compactMaxExclusive = breakpoints.getByName('md').width;
    const compute = (width: number): ViewportSize =>
      width < compactMaxExclusive ? 'compact' : 'full';

    this.size.set(compute(window.innerWidth));
    theme.onMediaQueryChange().subscribe(([, current]) => {
      this.size.set(compute(current.width));
    });
  }
}
