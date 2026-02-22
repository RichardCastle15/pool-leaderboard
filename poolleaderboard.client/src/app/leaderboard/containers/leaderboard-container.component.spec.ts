import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { Subject, of } from 'rxjs';

import { LeaderboardContainerComponent } from './leaderboard-container.component';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { LeaderboardService } from '../services/leaderboard.service';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';

@Component({ selector: 'app-leaderboard', template: '', standalone: true })
class MockLeaderboardComponent {
  loading = input(false);
  entries = input<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  newParticipant = output<string>();
}

describe('LeaderboardContainerComponent', () => {
  let component: LeaderboardContainerComponent;
  let fixture: ComponentFixture<LeaderboardContainerComponent>;
  let leaderboard$: Subject<TreeNode<LeaderboardEntryRow | {}>[]>;
  let mockHubConnection: { stop: jasmine.Spy };
  let mockLeaderboardService: jasmine.SpyObj<LeaderboardService>;

  beforeEach(async () => {
    leaderboard$ = new Subject();
    mockHubConnection = { stop: jasmine.createSpy('stop') };
    mockLeaderboardService = jasmine.createSpyObj(
      'LeaderboardService',
      ['connect', 'addParticipant'],
      { leaderboard$: leaderboard$.asObservable() }
    );
    mockLeaderboardService.connect.and.returnValue(mockHubConnection as any);

    await TestBed.configureTestingModule({
      imports: [LeaderboardContainerComponent]
    })
    .overrideComponent(LeaderboardContainerComponent, {
      remove: { imports: [LeaderboardComponent] },
      add: { imports: [MockLeaderboardComponent] }
    })
    .overrideProvider(LeaderboardService, { useValue: mockLeaderboardService })
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
});
