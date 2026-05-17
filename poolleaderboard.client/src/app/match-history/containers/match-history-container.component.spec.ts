import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { of, throwError } from 'rxjs';

import { MatchHistoryContainerComponent } from './match-history-container.component';
import { MatchHistoryComponent } from '../presenters/match-history.component';
import { MatchHistoryService } from '../services/match-history.service';
import { MatchHistoryPage, MatchHistoryRow } from '../models/match-history.model';
import { NbToastrService } from '@nebular/theme';

@Component({ selector: 'app-match-history', template: '', standalone: true })
class MockMatchHistoryComponent {
  entries = input<MatchHistoryRow[]>([]);
  loading = input(false);
  pageIndex = input(0);
  pageSize = input(10);
  total = input(0);
  pageChange = output<number>();
}

describe('MatchHistoryContainerComponent', () => {
  let component: MatchHistoryContainerComponent;
  let fixture: ComponentFixture<MatchHistoryContainerComponent>;
  let mockService: jasmine.SpyObj<MatchHistoryService>;
  let mockToastr: jasmine.SpyObj<NbToastrService>;

  const emptyPage: MatchHistoryPage = { total: 0, items: [] };
  const fullPage: MatchHistoryPage = {
    total: 42,
    items: [
      { type: 'OneVsOne', playedAt: '2026-05-17T10:00:00Z', winner: { id: 1, name: 'A' }, loser: { id: 2, name: 'B' }, delta: 50 }
    ]
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('MatchHistoryService', ['getPage']);
    mockService.getPage.and.returnValue(of(fullPage));
    mockToastr = jasmine.createSpyObj('NbToastrService', ['danger']);

    await TestBed.configureTestingModule({
      imports: [MatchHistoryContainerComponent]
    })
      .overrideComponent(MatchHistoryContainerComponent, {
        remove: { imports: [MatchHistoryComponent] },
        add: { imports: [MockMatchHistoryComponent] }
      })
      .overrideProvider(MatchHistoryService, { useValue: mockService })
      .overrideProvider(NbToastrService, { useValue: mockToastr })
      .compileComponents();

    fixture = TestBed.createComponent(MatchHistoryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fetches the first page on init with skip 0 and take 10', () => {
    expect(mockService.getPage).toHaveBeenCalledOnceWith(0, 10);
  });

  it('populates entries and total when getPage emits', () => {
    expect(component.entries()).toEqual(fullPage.items);
    expect(component.total()).toBe(42);
    expect(component.loading()).toBeFalse();
  });

  it('refetches with skip = pageIndex * pageSize when pageChange fires', () => {
    mockService.getPage.calls.reset();
    mockService.getPage.and.returnValue(of(emptyPage));

    component.loadPage(3);

    expect(mockService.getPage).toHaveBeenCalledOnceWith(30, 10);
    expect(component.pageIndex()).toBe(3);
  });

  it('shows a danger toast and stops loading on error', () => {
    mockService.getPage.and.returnValue(throwError(() => new Error('boom')));

    component.loadPage(1);

    expect(mockToastr.danger).toHaveBeenCalledOnceWith('Failed to load match history', 'Error');
    expect(component.loading()).toBeFalse();
  });
});
