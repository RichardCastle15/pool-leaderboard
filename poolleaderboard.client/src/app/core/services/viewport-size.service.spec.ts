import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NbMediaBreakpoint, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

import { ViewportSizeService } from './viewport-size.service';

describe('ViewportSizeService', () => {
  const md: NbMediaBreakpoint = { name: 'md', width: 768 };
  const sm: NbMediaBreakpoint = { name: 'sm', width: 576 };
  const lg: NbMediaBreakpoint = { name: 'lg', width: 992 };

  let mediaQuery$: Subject<[NbMediaBreakpoint, NbMediaBreakpoint]>;

  function configure(initialInnerWidth: number): ViewportSizeService {
    mediaQuery$ = new Subject();
    const themeStub = { onMediaQueryChange: () => mediaQuery$.asObservable() };
    const breakpointsStub = { getByName: (name: string) => name === 'md' ? md : { name, width: 0 } };

    spyOnProperty(window, 'innerWidth').and.returnValue(initialInnerWidth);

    TestBed.configureTestingModule({
      providers: [
        ViewportSizeService,
        { provide: NbThemeService, useValue: themeStub },
        { provide: NbMediaBreakpointsService, useValue: breakpointsStub },
      ]
    });

    return TestBed.inject(ViewportSizeService);
  }

  it('initialises to compact when the viewport is narrower than md', () => {
    const service = configure(500);
    expect(service.size()).toBe('compact');
  });

  it('initialises to full when the viewport is at the md breakpoint', () => {
    const service = configure(768);
    expect(service.size()).toBe('full');
  });

  it('initialises to full when the viewport is wider than md', () => {
    const service = configure(1200);
    expect(service.size()).toBe('full');
  });

  it('switches to compact when the active breakpoint drops below md', () => {
    const service = configure(1200);
    mediaQuery$.next([lg, sm]);
    expect(service.size()).toBe('compact');
  });

  it('switches back to full when the active breakpoint reaches md', () => {
    const service = configure(500);
    mediaQuery$.next([sm, md]);
    expect(service.size()).toBe('full');
  });
});
