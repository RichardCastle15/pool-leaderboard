import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output, signal } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { LeaderboardContainerComponent } from './leaderboard-container.component';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { LeaderboardService } from '../services/leaderboard.service';
import { KillerService } from '../../killer/killer.service';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { ViewportSizeService } from '../../core/services/viewport-size.service';
import { LeaderboardAction } from '../models/leaderboard-action.model';

@Component({ selector: 'app-leaderboard', template: '', standalone: true })
class MockLeaderboardComponent {
  loading = input(false);
  entries = input<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  size = input<'full' | 'compact'>('full');
  pendingAction = input<LeaderboardAction | null>(null);
  newParticipant = output<string>();
  startKiller = output<{ id: number; name: string }[]>();
  recordResult = output<{ winnerId: number; loserId: number }>();
}

describe('LeaderboardContainerComponent', () => {
  let component: LeaderboardContainerComponent;
  let fixture: ComponentFixture<LeaderboardContainerComponent>;
  let leaderboard$: Subject<TreeNode<LeaderboardEntryRow | {}>[]>;
  let mockHubConnection: { stop: jasmine.Spy };
  let mockLeaderboardService: jasmine.SpyObj<LeaderboardService>;
  let mockKillerService: jasmine.SpyObj<KillerService>;
  let mockToastrService: jasmine.SpyObj<NbToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    leaderboard$ = new Subject();
    mockHubConnection = { stop: jasmine.createSpy('stop') };
    mockLeaderboardService = jasmine.createSpyObj(
      'LeaderboardService',
      ['connect', 'addParticipant', 'recordResult'],
      { leaderboard$: leaderboard$.asObservable(), error$: new Subject().asObservable() }
    );
    mockLeaderboardService.connect.and.returnValue(mockHubConnection as any);
    mockLeaderboardService.recordResult.and.returnValue(of({}));
    mockKillerService = jasmine.createSpyObj('KillerService', ['startGame']);
    mockKillerService.startGame.and.returnValue(of(undefined));
    mockToastrService = jasmine.createSpyObj('NbToastrService', ['danger']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.resolveTo(true);
    const mockViewport = { size: signal<'full' | 'compact'>('full') };

    await TestBed.configureTestingModule({
      imports: [LeaderboardContainerComponent]
    })
    .overrideComponent(LeaderboardContainerComponent, {
      remove: { imports: [LeaderboardComponent] },
      add: { imports: [MockLeaderboardComponent] }
    })
    .overrideProvider(LeaderboardService, { useValue: mockLeaderboardService })
    .overrideProvider(KillerService, { useValue: mockKillerService })
    .overrideProvider(NbToastrService, { useValue: mockToastrService })
    .overrideProvider(Router, { useValue: mockRouter })
    .overrideProvider(ViewportSizeService, { useValue: mockViewport })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise with loading true and empty data', () => {
    expect(component.loading()).toBeTrue();
    expect(component.data()).toEqual([]);
  });

  it('should connect to the hub on init', () => {
    expect(mockLeaderboardService.connect).toHaveBeenCalledTimes(1);
  });

  it('should set loading to false when leaderboard$ emits', () => {
    leaderboard$.next([]);
    expect(component.loading()).toBeFalse();
  });

  it('should populate data when leaderboard$ emits entries', () => {
    const entries: TreeNode<LeaderboardEntryRow>[] = [
      { data: { name: 'Alice', points: 100, rank: 1, id: 1 } }
    ];
    leaderboard$.next(entries);
    expect(component.data()).toEqual(entries);
  });

  it('should update data on each subsequent leaderboard$ emission', () => {
    const first: TreeNode<LeaderboardEntryRow>[] = [
      { data: { name: 'Alice', points: 100, rank: 1, id: 1 } }
    ];
    const second: TreeNode<LeaderboardEntryRow>[] = [
      { data: { name: 'Bob', points: 200, rank: 1, id: 2 } }
    ];
    leaderboard$.next(first);
    leaderboard$.next(second);
    expect(component.data()).toEqual(second);
  });

  it('should stop the hub connection on destroy', () => {
    component.ngOnDestroy();
    expect(mockHubConnection.stop).toHaveBeenCalledTimes(1);
  });

  it('should call addParticipant on the service with the given name', () => {
    mockLeaderboardService.addParticipant.and.returnValue(of({}));
    component.addParticipant('Alice');
    expect(mockLeaderboardService.addParticipant).toHaveBeenCalledOnceWith('Alice');
  });

  it('should show a generic danger toast when addParticipant throws a non-409 error', () => {
    mockLeaderboardService.addParticipant.and.returnValue(throwError(() => new Error('server error')));
    component.addParticipant('Alice');
    expect(mockToastrService.danger).toHaveBeenCalledOnceWith('Failed to add participant', 'Error');
  });

  it('should show a 409 conflict message from the server when addParticipant returns 409', () => {
    const conflictError = new HttpErrorResponse({ status: 409, error: "A participant named 'Alice' already exists." });
    mockLeaderboardService.addParticipant.and.returnValue(throwError(() => conflictError));
    component.addParticipant('Alice');
    expect(mockToastrService.danger).toHaveBeenCalledOnceWith("A participant named 'Alice' already exists.", 'Error');
  });

  describe('startKiller', () => {
    const players = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }];

    it('should call killerService.startGame with the selected players', () => {
      component.startKiller(players);
      expect(mockKillerService.startGame).toHaveBeenCalledOnceWith(players);
    });

    it('should navigate to /killer after game starts', () => {
      component.startKiller(players);
      expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/killer']);
    });

    it('should show a danger toast when startGame fails', () => {
      mockKillerService.startGame.and.returnValue(throwError(() => new Error('server error')));
      component.startKiller(players);
      expect(mockToastrService.danger).toHaveBeenCalledOnceWith('Failed to start killer game', 'Error');
    });
  });

  describe('recordResult', () => {
    it('should call leaderboardService.recordResult with the winner and loser', () => {
      component.recordResult({ winnerId: 1, loserId: 2 });
      expect(mockLeaderboardService.recordResult).toHaveBeenCalledOnceWith(1, 2);
    });

    it('should show a danger toast when recordResult fails', () => {
      mockLeaderboardService.recordResult.and.returnValue(throwError(() => new Error('server error')));
      component.recordResult({ winnerId: 1, loserId: 2 });
      expect(mockToastrService.danger).toHaveBeenCalledOnceWith('Failed to record result', 'Error');
    });
  });

  describe('pending action', () => {
    const players = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }];
    let request$: Subject<Object>;

    beforeEach(() => {
      request$ = new Subject();
      mockLeaderboardService.addParticipant.and.returnValue(request$);
      mockLeaderboardService.recordResult.and.returnValue(request$);
      mockKillerService.startGame.and.returnValue(request$ as Subject<any>);
    });

    it('should start with no pending action', () => {
      expect(component.pendingAction()).toBeNull();
    });

    it('should mark the action as pending until the request completes', () => {
      component.addParticipant('Alice');
      expect(component.pendingAction()).toBe('addParticipant');
      request$.next({});
      request$.complete();
      expect(component.pendingAction()).toBeNull();
    });

    it('should clear the pending action when the request fails', () => {
      component.recordResult({ winnerId: 1, loserId: 2 });
      expect(component.pendingAction()).toBe('recordResult');
      request$.error(new Error('server error'));
      expect(component.pendingAction()).toBeNull();
    });

    it('should ignore a repeated startKiller while one is in flight', () => {
      component.startKiller(players);
      component.startKiller(players);
      expect(mockKillerService.startGame).toHaveBeenCalledTimes(1);
      expect(component.pendingAction()).toBe('startKiller');
    });

    it('should ignore other actions while one is in flight', () => {
      component.startKiller(players);
      component.addParticipant('Alice');
      component.recordResult({ winnerId: 1, loserId: 2 });
      expect(mockLeaderboardService.addParticipant).not.toHaveBeenCalled();
      expect(mockLeaderboardService.recordResult).not.toHaveBeenCalled();
    });

    it('should stay pending after startKiller succeeds until navigation to /killer finishes', async () => {
      let finishNavigation!: (ok: boolean) => void;
      mockRouter.navigate.and.returnValue(new Promise<boolean>(resolve => finishNavigation = resolve));
      component.startKiller(players);
      request$.next(undefined as any);
      request$.complete();
      expect(component.pendingAction()).toBe('startKiller');

      finishNavigation(true);
      await fixture.whenStable();
      expect(component.pendingAction()).toBeNull();
    });

    it('should clear the pending action when startKiller fails', () => {
      component.startKiller(players);
      request$.error(new Error('server error'));
      expect(component.pendingAction()).toBeNull();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow another action once the previous one has finished', () => {
      component.recordResult({ winnerId: 1, loserId: 2 });
      request$.complete();
      component.recordResult({ winnerId: 2, loserId: 1 });
      expect(mockLeaderboardService.recordResult).toHaveBeenCalledTimes(2);
    });

    it('should pass the pending action to the presenter', () => {
      component.addParticipant('Alice');
      fixture.detectChanges();
      const presenter = fixture.debugElement.children[0].componentInstance as MockLeaderboardComponent;
      expect(presenter.pendingAction()).toBe('addParticipant');
    });
  });
});
