import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NbThemeModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { MatchHistoryComponent } from './match-history.component';
import { MatchHistoryRow } from '../models/match-history.model';

describe('MatchHistoryComponent', () => {
  let fixture: ComponentFixture<MatchHistoryComponent>;
  let component: MatchHistoryComponent;

  const oneVsOne: MatchHistoryRow = {
    type: 'OneVsOne',
    playedAt: '2026-05-17T10:00:00Z',
    winner: { id: 1, name: 'Richard' },
    loser: { id: 2, name: 'James' },
    delta: 50
  };

  const killer: MatchHistoryRow = {
    type: 'Killer',
    playedAt: '2026-05-17T11:00:00Z',
    players: [
      { id: 1, name: 'Richard', delta: 20, isWinner: true },
      { id: 2, name: 'James', delta: -10, isWinner: false },
      { id: 3, name: 'Rob', delta: -10, isWinner: false }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchHistoryComponent, NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchHistoryComponent);
    component = fixture.componentInstance;
  });

  it('renders a row for each entry', () => {
    fixture.componentRef.setInput('entries', [oneVsOne, killer]);
    fixture.componentRef.setInput('total', 2);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.match-row'));
    expect(rows.length).toBe(2);
  });

  it('renders a one-vs-one row in the expected format', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 1);
    fixture.detectChanges();

    const body = fixture.debugElement.query(By.css('.row-body')).nativeElement.textContent;
    expect(body.trim()).toContain('Richard vs. James (+/-50)');
  });

  it('renders a killer row in the expected format', () => {
    fixture.componentRef.setInput('entries', [killer]);
    fixture.componentRef.setInput('total', 1);
    fixture.detectChanges();

    const body = fixture.debugElement.query(By.css('.row-body')).nativeElement.textContent;
    expect(body.replace(/\s+/g, ' ').trim()).toBe('Richard (+20), James (-10), Rob (-10)');
  });

  it('shows an empty message when there are no entries and not loading', () => {
    fixture.componentRef.setInput('entries', []);
    fixture.componentRef.setInput('total', 0);
    fixture.detectChanges();

    const empty = fixture.debugElement.query(By.css('.empty-message'));
    expect(empty).toBeTruthy();
    expect(empty.nativeElement.textContent.trim()).toBe('No matches recorded yet.');
  });

  it('disables Prev on the first page', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 50);
    fixture.componentRef.setInput('pageIndex', 0);
    fixture.detectChanges();

    const prev = fixture.debugElement.query(By.css('.prev-button')).nativeElement as HTMLButtonElement;
    expect(prev.disabled).toBeTrue();
  });

  it('disables Next on the last page', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 11);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageIndex', 1);
    fixture.detectChanges();

    const next = fixture.debugElement.query(By.css('.next-button')).nativeElement as HTMLButtonElement;
    expect(next.disabled).toBeTrue();
  });

  it('emits pageChange when Next is clicked', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 30);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageIndex', 0);
    fixture.detectChanges();

    let emitted: number | undefined;
    component.pageChange.subscribe(v => (emitted = v));

    const next = fixture.debugElement.query(By.css('.next-button')).nativeElement as HTMLButtonElement;
    next.click();

    expect(emitted).toBe(1);
  });

  it('emits pageChange when Prev is clicked from a non-first page', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 30);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageIndex', 2);
    fixture.detectChanges();

    let emitted: number | undefined;
    component.pageChange.subscribe(v => (emitted = v));

    const prev = fixture.debugElement.query(By.css('.prev-button')).nativeElement as HTMLButtonElement;
    prev.click();

    expect(emitted).toBe(1);
  });

  it('shows "Page X of Y" reflecting current state', () => {
    fixture.componentRef.setInput('entries', [oneVsOne]);
    fixture.componentRef.setInput('total', 25);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageIndex', 1);
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('.page-label')).nativeElement.textContent;
    expect(label.trim()).toBe('Page 2 of 3');
  });
});
