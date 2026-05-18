import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { HubConnectionBuilder } from '@microsoft/signalr';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents$: Subject<unknown>;

  const mockConnection = {
    on: jasmine.createSpy('on'),
    start: jasmine.createSpy('start').and.returnValue(Promise.resolve()),
    invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    routerEvents$ = new Subject();
    mockConnection.on.calls.reset();
    mockConnection.start.calls.reset();

    spyOn(HubConnectionBuilder.prototype, 'build').and.returnValue(mockConnection as any);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: { events: routerEvents$.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('items signal', () => {
    it('includes Leaderboard, Killer and Match History top-level entries', () => {
      const titles = component.items().map(i => i.title);
      expect(titles).toContain('Leaderboard');
      expect(titles).toContain('Killer');
      expect(titles).toContain('Match History');
    });

    it('Match History entry links to /match-history', () => {
      const entry = component.items().find(i => i.title === 'Match History')!;
      expect(entry.link).toBe('/match-history');
    });

    it('adds a Showcase top-level entry in development mode', () => {
      const titles = component.items().map(i => i.title);
      expect(titles).toContain('Showcase');
    });

    it('Showcase entry includes a Match history sub-group', () => {
      const showcase = component.items().find(i => i.title === 'Showcase')!;
      const matchHistoryGroup = showcase.children?.find(c => c.title === 'Match history');
      expect(matchHistoryGroup).toBeDefined();
    });

    it('Match history showcase sub-group contains all four entries', () => {
      const showcase = component.items().find(i => i.title === 'Showcase')!;
      const matchHistoryGroup = showcase.children!.find(c => c.title === 'Match history')!;
      const subTitles = matchHistoryGroup.children!.map(c => c.title);
      expect(subTitles).toContain('Empty');
      expect(subTitles).toContain('Mixed');
      expect(subTitles).toContain('Last page partial');
      expect(subTitles).toContain('Loading');
    });
  });

  describe('sidebarStateChange', () => {
    it('updates sidebarState to the emitted value', () => {
      component.sidebarStateChange('expanded');
      expect(component.sidebarState()).toBe('expanded');
    });

    it('initialises sidebarResponsiveState to pc on first expanded event', () => {
      expect(component.sidebarResponsiveState()).toBeUndefined();
      component.sidebarStateChange('expanded');
      expect(component.sidebarResponsiveState()).toBe('pc');
    });

    it('initialises sidebarResponsiveState to mobile on first collapsed event', () => {
      component.sidebarStateChange('collapsed');
      expect(component.sidebarResponsiveState()).toBe('mobile');
    });

    it('initialises sidebarResponsiveState to mobile on first compacted event', () => {
      component.sidebarStateChange('compacted');
      expect(component.sidebarResponsiveState()).toBe('mobile');
    });

    it('does not overwrite sidebarResponsiveState once it is set', () => {
      component.sidebarResponsiveChange('tablet');
      component.sidebarStateChange('collapsed');
      expect(component.sidebarResponsiveState()).toBe('tablet');
    });
  });

  describe('expandSidebar / collapseSidebar', () => {
    it('expandSidebar sets state to expanded', () => {
      component.expandSidebar();
      expect(component.sidebarState()).toBe('expanded');
    });

    it('collapseSidebar sets state to collapsed on mobile', () => {
      component.sidebarResponsiveChange('mobile');
      component.collapseSidebar();
      expect(component.sidebarState()).toBe('collapsed');
    });

    it('collapseSidebar sets state to compacted on tablet', () => {
      component.sidebarResponsiveChange('tablet');
      component.collapseSidebar();
      expect(component.sidebarState()).toBe('compacted');
    });

    it('collapseSidebar is a no-op on pc', () => {
      component.sidebarResponsiveChange('pc');
      component.sidebarState.set('expanded');
      component.collapseSidebar();
      expect(component.sidebarState()).toBe('expanded');
    });
  });

  describe('showCollpaseSidebar', () => {
    it('is true when mobile and expanded', () => {
      component.sidebarResponsiveChange('mobile');
      component.sidebarState.set('expanded');
      expect(component.showCollpaseSidebar()).toBeTrue();
    });

    it('is true when tablet and expanded', () => {
      component.sidebarResponsiveChange('tablet');
      component.sidebarState.set('expanded');
      expect(component.showCollpaseSidebar()).toBeTrue();
    });

    it('is false when pc and expanded', () => {
      component.sidebarResponsiveChange('pc');
      component.sidebarState.set('expanded');
      expect(component.showCollpaseSidebar()).toBeFalse();
    });

    it('is false when mobile and not expanded', () => {
      component.sidebarResponsiveChange('mobile');
      component.sidebarState.set('collapsed');
      expect(component.showCollpaseSidebar()).toBeFalse();
    });
  });

  describe('showExpandSidebar', () => {
    it('is true when mobile and collapsed', () => {
      component.sidebarResponsiveChange('mobile');
      component.sidebarState.set('collapsed');
      expect(component.showExpandSidebar()).toBeTrue();
    });

    it('is true when tablet and compacted', () => {
      component.sidebarResponsiveChange('tablet');
      component.sidebarState.set('compacted');
      expect(component.showExpandSidebar()).toBeTrue();
    });

    it('is false when tablet and collapsed', () => {
      component.sidebarResponsiveChange('tablet');
      component.sidebarState.set('collapsed');
      expect(component.showExpandSidebar()).toBeFalse();
    });

    it('is false when mobile and compacted', () => {
      component.sidebarResponsiveChange('mobile');
      component.sidebarState.set('compacted');
      expect(component.showExpandSidebar()).toBeFalse();
    });

    it('is false on pc', () => {
      component.sidebarResponsiveChange('pc');
      component.sidebarState.set('collapsed');
      expect(component.showExpandSidebar()).toBeFalse();
    });
  });

  it('collapses the sidebar when a NavigationEnd event fires', () => {
    component.sidebarResponsiveChange('mobile');
    component.sidebarState.set('expanded');

    routerEvents$.next(new NavigationEnd(1, '/leaderboard', '/leaderboard'));

    expect(component.sidebarState()).toBe('collapsed');
  });

  it('does not collapse the sidebar for non-NavigationEnd router events', () => {
    component.sidebarResponsiveChange('mobile');
    component.sidebarState.set('expanded');

    routerEvents$.next({ type: 'NavigationStart' });

    expect(component.sidebarState()).toBe('expanded');
  });
});
