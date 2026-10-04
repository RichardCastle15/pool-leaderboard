import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardComponent } from './leaderboard.component';
import { DOCUMENT } from '@angular/common';
import { NbDialogRef, NbDialogService, NbIconModule, NbThemeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { By } from '@angular/platform-browser';
import { NewParticipantComponent } from './new-participant/new-participant.component';
import { Subject } from 'rxjs';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  const entries = [
    {
      data: { id: 1, name: 'Richard', points: 1906, rank: 1 },
      children: [
        { data: { name: 'Head-To-Head', points: 1696, rank: 2 } },
        { data: { name: 'Killer', points: 210, rank: 1 } },
      ]
    },
    {
      data: { id: 2, name: 'Russel', points: 1711, rank: 2 },
      children: [
        { data: { name: 'Head-To-Head', points: 1701, rank: 1 } },
        { data: { name: 'Killer', points: 10, rank: 4 } },
      ]
    },
    {
      data: { id: 3, name: 'Stephen B', points: 1440, rank: 3 },
      children: [
        { data: { name: 'Head-To-Head', points: 1400, rank: 3 } },
        { data: { name: 'Killer', points: 40, rank: 3 } },
      ]
    },
  ]

  let dialogClose: Subject<string>;
  let mockDialogRef: Partial<NbDialogRef<NewParticipantComponent>>;
  let mockDialogService: Partial<NbDialogService>;

  beforeEach(async () => {
    dialogClose = new Subject<string>();
    mockDialogRef = {
      onClose: dialogClose
    };
    mockDialogService = {
      open: jasmine.createSpy('open').and.returnValue(mockDialogRef)
    };
    
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [LeaderboardComponent, NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule],
      providers: [
        { provide: DOCUMENT, useValue: document },
        { provide: NbDialogService, useValue: mockDialogService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a row for each entry', () => {
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    const rowCount = fixture.debugElement.queryAll(By.css('table tr')).length;
    // 3 entries plus the header row.
    expect(rowCount).toBe(4);
  });

  it('should highlight rows when clicked', () => {
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    fixture.debugElement.queryAll(By.css('table tr')).forEach(de => de.nativeElement.click());
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.selected-row')).length).toBe(3);
  });

  it('should un-highlight rows when clicked again', () => {
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    fixture.debugElement.queryAll(By.css('table tr')).forEach(de => de.nativeElement.click());
    fixture.detectChanges();
    fixture.debugElement.queryAll(By.css('table tr')).forEach(de => de.nativeElement.click());
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.selected-row')).length).toBe(0);
  });

  it('should sort rows when title clicked', () => {
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    const tableHeaders = fixture.debugElement.queryAll(By.css('table th'));
    const rankHeader = tableHeaders.filter(de => de.nativeElement.innerText === "Rank");
    rankHeader[0].nativeElement.click();
    fixture.detectChanges();
    const firstResult: string = fixture.debugElement.query(By.css('table tr td')).nativeElement.innerText
    expect(firstResult.trim()).toBe('Stephen B');
  });

  describe('loading', () => {
    it('should show 3 placeholder rows', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const loadingRows = fixture.debugElement.queryAll(By.css('tr.loading-row')).length;
      expect(loadingRows).toBe(3);
    })
  })

  describe('action buttons', () => {
    it('should disable head-to-head and killer actions when noone selected', () => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();
      const isHeadToHeadDisabled = fixture.debugElement.query(By.css('#head-to-head-action')).componentInstance.disabled;
      const isKillerDisabled = fixture.debugElement.query(By.css('#killer-action')).componentInstance.disabled;
      expect(isHeadToHeadDisabled).toBeTrue();
      expect(isKillerDisabled).toBeTrue();
    });

    it('should enable head-to-head result when exactly 2 rows are selected', () => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();
      
      // Click on the first two data rows (skip header row at index 0)
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      dataRows[0].nativeElement.click(); // Select first row
      dataRows[1].nativeElement.click(); // Select second row
      fixture.detectChanges();
      
      const isDisabled = fixture.debugElement.query(By.css('#head-to-head-action')).componentInstance.disabled;
      expect(isDisabled).toBeFalse();
    });

    it('should keep killer disabled when only one player is selected', () => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();

      // Skip header row at index 0
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      dataRows[0].nativeElement.click(); // Select first row
      fixture.detectChanges();

      const isDisabled = fixture.debugElement.query(By.css('#killer-action')).componentInstance.disabled;
      expect(isDisabled).toBeTrue();
    });

    it('should enable killer when at least two players are selected', () => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();

      // Skip header row at index 0
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      dataRows[0].nativeElement.click(); // Select first row
      dataRows[1].nativeElement.click(); // Select second row
      fixture.detectChanges();

      const isDisabled = fixture.debugElement.query(By.css('#killer-action')).componentInstance.disabled;
      expect(isDisabled).toBeFalse();
    });

    it('should show correct count in killer badge', () => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();

      // Click on the first two data rows (skip header row at index 0)
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      dataRows[0].nativeElement.click(); // Select first row
      dataRows[1].nativeElement.click(); // Select second row
      fixture.detectChanges();

      const countDisplayed = fixture.debugElement.query(By.css('#killer-action nb-badge')).componentInstance.text;
      expect(countDisplayed).toBe('2');
    });

    it('should emit on the newParticipant output when adding a new participant', () => {
      let participantName = '';
      fixture.componentInstance.newParticipant.subscribe(result => participantName = result);
      const addParticipantButton = fixture.debugElement.query(By.css('.add-participant-action'));
      addParticipantButton.triggerEventHandler('click');
      dialogClose.next('test user');
      dialogClose.complete();

      expect(participantName).toBe('test user');
    })
  });

  describe('head-to-head swing preview', () => {
    function selectRows(...indexes: number[]) {
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      indexes.forEach(i => dataRows[i].nativeElement.click());
      fixture.detectChanges();
    }

    function swingText(): string[] {
      return fixture.debugElement.queryAll(By.css('#head-to-head-action .swing-player'))
        .map(de => (de.nativeElement as HTMLElement).textContent!.trim());
    }

    beforeEach(() => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();
    });

    it('should not show a swing when fewer than 2 players are selected', () => {
      selectRows(0);
      expect(swingText()).toEqual([]);
    });

    it('should show what each player would win when exactly 2 are selected', () => {
      selectRows(0, 1);
      expect(swingText()).toEqual(['Richard ±25', 'Russel ±75']);
    });

    it('should not show a swing when more than 2 players are selected', () => {
      selectRows(0, 1, 2);
      expect(swingText()).toEqual([]);
    });

    it('should show first names only in compact mode', () => {
      fixture.componentRef.setInput('size', 'compact');
      selectRows(1, 2);
      expect(swingText()).toEqual(['Russel ±17', 'Stephen ±83']);
    });
  });

  describe('pending action', () => {
    function selectRows(...indexes: number[]) {
      const dataRows = fixture.debugElement.queryAll(By.css('table tr')).slice(1);
      indexes.forEach(i => dataRows[i].nativeElement.click());
      fixture.detectChanges();
    }

    function action(selector: string) {
      return fixture.debugElement.query(By.css(selector));
    }

    beforeEach(() => {
      fixture.componentRef.setInput('entries', entries);
      fixture.detectChanges();
      selectRows(0, 1);
    });

    it('should show a spinner only on the pending action', () => {
      fixture.componentRef.setInput('pendingAction', 'startKiller');
      fixture.detectChanges();
      expect(action('#killer-action nb-spinner')).toBeTruthy();
      expect(action('#head-to-head-action nb-spinner')).toBeNull();
      expect(action('.add-participant-action nb-spinner')).toBeNull();
      expect(action('#killer-action').attributes['aria-busy']).toBe('true');
    });

    it('should disable every action while a request is in flight', () => {
      fixture.componentRef.setInput('pendingAction', 'recordResult');
      fixture.detectChanges();
      ['#head-to-head-action', '#killer-action', '.add-participant-action'].forEach(selector => {
        expect(action(selector).componentInstance.disabled).withContext(selector).toBeTrue();
        expect(action(selector).attributes['aria-disabled']).withContext(selector).toBe('true');
      });
    });

    it('should not emit or open dialogs when actions are clicked while busy', () => {
      const killerSpy = jasmine.createSpy('startKiller');
      component.startKiller.subscribe(killerSpy);
      fixture.componentRef.setInput('pendingAction', 'addParticipant');
      fixture.detectChanges();

      action('#killer-action').nativeElement.click();
      action('#head-to-head-action').nativeElement.click();
      action('.add-participant-action').nativeElement.click();

      expect(killerSpy).not.toHaveBeenCalled();
      expect(mockDialogService.open).not.toHaveBeenCalled();
    });

    it('should re-enable actions once the request settles', () => {
      fixture.componentRef.setInput('pendingAction', 'startKiller');
      fixture.detectChanges();
      fixture.componentRef.setInput('pendingAction', null);
      fixture.detectChanges();
      expect(action('#killer-action').componentInstance.disabled).toBeFalse();
      expect(action('#killer-action nb-spinner')).toBeNull();
    });
  });

  it('should not start killer when fewer than 2 players are selected', () => {
    const killerSpy = jasmine.createSpy('startKiller');
    component.startKiller.subscribe(killerSpy);
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('#killer-action')).nativeElement.click();
    expect(killerSpy).not.toHaveBeenCalled();
  });
});
