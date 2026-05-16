import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KillerComponent } from './killer.component';
import { NbDialogRef, NbDialogService, NbIconModule, NbThemeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { KillerGame } from './types/killer-game.model';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

describe('KillerComponent', () => {
  let component: KillerComponent;
  let fixture: ComponentFixture<KillerComponent>;
  let dialogClose: Subject<boolean | undefined>;
  let mockDialogRef: Partial<NbDialogRef<unknown>>;
  let mockDialogService: Partial<NbDialogService>;

  beforeEach(async () => {
    dialogClose = new Subject<boolean | undefined>();
    mockDialogRef = { onClose: dialogClose };
    mockDialogService = {
      open: jasmine.createSpy('open').and.returnValue(mockDialogRef)
    };

    await TestBed.configureTestingModule({
      imports: [KillerComponent,  NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule],
      providers: [
        { provide: NbDialogService, useValue: mockDialogService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a row per player', () => {
    const game: KillerGame = {
      currentPlayerIndex: 0,
      playerRows: [
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
      ]
    };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.player-row'));
    expect(rows.length).toBe(4);
  });

  it('should mark an eliminated player', () => {
    const game: KillerGame = {
      currentPlayerIndex: 0,
      playerRows: [
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 0, name: 'test', eliminated: true},
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
      ]
    };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.player-row'));
    expect(rows[1].classes['eliminated']).toBeTrue();
  });

  it('should mark the current player', () => {
    const game: KillerGame = {
      currentPlayerIndex: 1,
      playerRows: [
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 3, name: 'test'},
      ]
    };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.player-row'));
    expect(rows[1].classes['current']).toBeTrue();
  });

  it('should show the correct life and death icons', () => {
    const game: KillerGame = {
      currentPlayerIndex: 1,
      playerRows: [
        {livesRemaining: 3, name: 'test'},
        {livesRemaining: 2, name: 'test'},
        {livesRemaining: 1, name: 'test'},
        {livesRemaining: 0, name: 'test', eliminated: true},
      ]
    };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.player-row'));
    expect(rows[0].queryAll(By.css('.lives-column .killer-life')).length).toBe(3);
    expect(rows[0].queryAll(By.css('.lives-column .killer-death')).length).toBe(0);
    expect(rows[1].queryAll(By.css('.lives-column .killer-life')).length).toBe(2);
    expect(rows[1].queryAll(By.css('.lives-column .killer-death')).length).toBe(1);
    expect(rows[2].queryAll(By.css('.lives-column .killer-life')).length).toBe(1);
    expect(rows[2].queryAll(By.css('.lives-column .killer-death')).length).toBe(2);
    expect(rows[3].queryAll(By.css('.lives-column .killer-life')).length).toBe(0);
    expect(rows[3].queryAll(By.css('.lives-column .killer-death')).length).toBe(3);
  });

  describe('disconnected', () => {
    it('should show a warning banner when disconnected is true', () => {
      fixture.componentRef.setInput('disconnected', true);
      fixture.detectChanges();
      const alert = fixture.debugElement.query(By.css('nb-alert'));
      expect(alert).toBeTruthy();
    });

    it('should not show a warning banner when disconnected is false', () => {
      fixture.componentRef.setInput('disconnected', false);
      fixture.detectChanges();
      const alert = fixture.debugElement.query(By.css('nb-alert'));
      expect(alert).toBeNull();
    });
  });

  describe('isActive', () => {
    it('should show the game table when isActive is true', () => {
      const game: KillerGame = {
        currentPlayerIndex: 0,
        playerRows: [{ livesRemaining: 3, name: 'test' }]
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.player-row'));
      expect(rows.length).toBe(1);
    });

    it('should show no active game message when isActive is false', () => {
      fixture.componentRef.setInput('isActive', false);
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('No active game');
    });

    it('should hide the game table when isActive is false', () => {
      fixture.componentRef.setInput('isActive', false);
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.player-row'));
      expect(rows.length).toBe(0);
    });
  });

  describe('action outputs', () => {
    beforeEach(() => {
      const game: KillerGame = {
        currentPlayerIndex: 0,
        playerRows: [{ livesRemaining: 3, name: 'test' }, { livesRemaining: 3, name: 'test2' }]
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();
    });

    it('should emit pot when pot button is clicked', () => {
      let emitted = false;
      component.pot.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-pot-action')).triggerEventHandler('click');
      expect(emitted).toBeTrue();
    });

    it('should emit miss when miss button is clicked', () => {
      let emitted = false;
      component.miss.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-miss-action')).triggerEventHandler('click');
      expect(emitted).toBeTrue();
    });

    it('should emit earlyBlackPot when early black button is clicked', () => {
      let emitted = false;
      component.earlyBlackPot.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-full-elimination-action')).triggerEventHandler('click');
      expect(emitted).toBeTrue();
    });

    it('should emit undo when undo button is clicked', () => {
      let emitted = false;
      component.undo.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-undo-action')).triggerEventHandler('click');
      expect(emitted).toBeTrue();
    });

    it('should open a confirmation dialog when abandon button is clicked', () => {
      fixture.debugElement.query(By.css('#killer-abandon-action')).triggerEventHandler('click');
      expect(mockDialogService.open).toHaveBeenCalled();
    });

    it('should not emit abandon when the confirmation dialog is dismissed', () => {
      let emitted = false;
      component.abandon.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-abandon-action')).triggerEventHandler('click');
      dialogClose.next(false);
      dialogClose.complete();
      expect(emitted).toBeFalse();
    });

    it('should emit abandon when the confirmation dialog is confirmed', () => {
      let emitted = false;
      component.abandon.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('#killer-abandon-action')).triggerEventHandler('click');
      dialogClose.next(true);
      dialogClose.complete();
      expect(emitted).toBeTrue();
    });
  });

  describe('confirm end', () => {
    it('should not show confirm end card when there is no winner', () => {
      const game: KillerGame = {
        currentPlayerIndex: 0,
        playerRows: [{ livesRemaining: 3, name: 'Alice' }, { livesRemaining: 3, name: 'Bob' }]
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();
      const confirmCard = fixture.debugElement.query(By.css('.confirm-end-card'));
      expect(confirmCard).toBeNull();
    });

    it('should show confirm end card when there is a winner', () => {
      const game: KillerGame = {
        currentPlayerIndex: 1,
        playerRows: [{ livesRemaining: 0, name: 'Alice', eliminated: true }, { livesRemaining: 3, name: 'Bob' }],
        winner: 'Bob'
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();
      const confirmCard = fixture.debugElement.query(By.css('.confirm-end-card'));
      expect(confirmCard).toBeTruthy();
    });

    it('should show the winner name in the confirm end card', () => {
      const game: KillerGame = {
        currentPlayerIndex: 1,
        playerRows: [{ livesRemaining: 0, name: 'Alice', eliminated: true }, { livesRemaining: 3, name: 'Bob' }],
        winner: 'Bob'
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();
      const text: string = fixture.debugElement.query(By.css('.confirm-end-card')).nativeElement.textContent;
      expect(text).toContain('Bob');
    });

    it('should emit confirmEnd when confirm end button is clicked', () => {
      const game: KillerGame = {
        currentPlayerIndex: 1,
        playerRows: [{ livesRemaining: 0, name: 'Alice', eliminated: true }, { livesRemaining: 3, name: 'Bob' }],
        winner: 'Bob'
      };
      fixture.componentRef.setInput('game', game);
      fixture.componentRef.setInput('isActive', true);
      fixture.detectChanges();

      let emitted = false;
      component.confirmEnd.subscribe(() => emitted = true);
      fixture.debugElement.query(By.css('.confirm-end-card button')).nativeElement.click();
      expect(emitted).toBeTrue();
    });
  });

  it('should show the correct sudden death icons', () => {
    const game: KillerGame = {
      currentPlayerIndex: 3,
      playerRows: [
        {livesRemaining: 1, name: 'test', missedInSuddenDeath: true},
        {livesRemaining: 0, name: 'test'},
        {livesRemaining: 1, name: 'test', missedInSuddenDeath: true},
        {livesRemaining: 1, name: 'test'},
      ]
    };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.player-row'));
    expect(rows[0].queryAll(By.css('.lives-column .killer-sudden-death-miss')).length).toBe(1);
    expect(rows[0].queryAll(By.css('.lives-column .killer-death')).length).toBe(2);
    expect(rows[1].queryAll(By.css('.lives-column .killer-sudden-death-miss')).length).toBe(0);
    expect(rows[1].queryAll(By.css('.lives-column .killer-death')).length).toBe(3);
    expect(rows[2].queryAll(By.css('.lives-column .killer-sudden-death-miss')).length).toBe(1);
    expect(rows[2].queryAll(By.css('.lives-column .killer-death')).length).toBe(2);
    expect(rows[3].queryAll(By.css('.lives-column .killer-life')).length).toBe(1);
    expect(rows[3].queryAll(By.css('.lives-column .killer-death')).length).toBe(2);
  });
});
