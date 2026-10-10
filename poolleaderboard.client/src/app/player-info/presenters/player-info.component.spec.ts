import { registerLocaleData } from '@angular/common';
import localeEnGb from '@angular/common/locales/en-GB';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NbThemeModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { PlayerInfoComponent } from './player-info.component';
import { MatchHistoryRow } from '../../match-history/models/match-history.model';

registerLocaleData(localeEnGb);

describe('PlayerInfoComponent', () => {
  let fixture: ComponentFixture<PlayerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoComponent, NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule],
      providers: [{ provide: LOCALE_ID, useValue: 'en-GB' }]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerInfoComponent);
  });

  it('shows match dates in UK format (day first, 24-hour clock)', () => {
    const match: MatchHistoryRow = {
      type: 'OneVsOne',
      // No offset in the string, so it is read as local time and shown as stored, whatever the browser zone.
      playedAt: '2026-02-03T14:05:00',
      winner: { id: 1, name: 'Richard' },
      loser: { id: 2, name: 'James' },
      delta: 50
    };
    fixture.componentRef.setInput('playerName', 'Richard');
    fixture.componentRef.setInput('matchEntries', [match]);
    fixture.componentRef.setInput('matchTotal', 1);
    fixture.detectChanges();

    const playedAt = fixture.debugElement.query(By.css('.played-at')).nativeElement.textContent;
    expect(playedAt.trim()).toBe('03/02/2026, 14:05');
  });
});
