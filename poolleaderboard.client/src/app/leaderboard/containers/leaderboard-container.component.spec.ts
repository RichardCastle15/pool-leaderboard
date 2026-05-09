import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { LeaderboardContainerComponent } from './leaderboard-container.component';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { LeaderboardService } from '../services/leaderboard.service';
import { KillerService } from '../../killer/killer.service';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({ selector: 'app-leaderboard', template: '', standalone: true })
class MockLeaderboardComponent {
  loading = input(false);
  entries = input<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  newParticipant = output<string>();
  startKiller = output<{ id: number; name: string }[]>();
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
      ['connect', 'addParticipant'],
      { leaderboard$: leaderboard$.asObservable(), error$: new Subject().asObservable() }
    );
    mockLeaderboardService.connect.and.returnValue(mockHubConnection as any);
    mockKillerService = jasmine.createSpyObj('KillerService', ['startGame']);
    mockKillerService.startGame.and.returnValue(of(undefined));
    mockToastrService = jasmine.createSpyObj('NbToastrService', ['danger']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

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

  it('should show a danger toast when addParticipant throws an error', () => {
    mockLeaderboardService.addParticipant.and.returnValue(throwError(() => new Error('server error')));
    component.addParticipant('Alice');
    expect(mockToastrService.danger).toHaveBeenCalledOnceWith('Failed to add participant', 'Error');
  });

  describe('startKiller', () => {
    const players = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

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
});
