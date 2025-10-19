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
});
