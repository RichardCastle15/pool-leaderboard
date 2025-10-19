import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KillerComponent } from './killer.component';
import { NbIconModule, NbThemeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { KillerGame } from './types/killer-game.model';
import { By } from '@angular/platform-browser';

describe('KillerComponent', () => {
  let component: KillerComponent;
  let fixture: ComponentFixture<KillerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KillerComponent,  NbThemeModule.forRoot(), NbIconModule, NbEvaIconsModule]
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
});
