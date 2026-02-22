import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { EMPTY } from 'rxjs';

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

  const mockLeaderboardService = {
    leaderboard$: EMPTY,
    connect: () => ({ stop: () => Promise.resolve() }),
  };

  beforeEach(async () => {
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
});
