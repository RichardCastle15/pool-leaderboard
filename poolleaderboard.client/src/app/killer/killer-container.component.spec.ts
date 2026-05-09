import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { KillerContainerComponent } from './killer-container.component';
import { KillerComponent } from './killer.component';
import { KillerService, KillerGameServerState } from './killer.service';
import { KillerGame } from './types/killer-game.model';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({ selector: 'app-killer', template: '', standalone: true })
class MockKillerComponent {
  game = input<KillerGame>();
  disconnected = input(false);
  isActive = input(true);
  pot = output();
  miss = output();
  earlyBlackPot = output();
  undo = output();
  abandon = output();
  confirmEnd = output();
}

describe('KillerContainerComponent', () => {
  let component: KillerContainerComponent;
  let fixture: ComponentFixture<KillerContainerComponent>;
  let game$: Subject<KillerGameServerState>;
  let gameEnded$: Subject<void>;
  let error$: Subject<string>;
  let disconnected$: Subject<boolean>;
  let mockHubConnection: { stop: jasmine.Spy };
  let mockKillerService: jasmine.SpyObj<KillerService>;
  let mockToastrService: jasmine.SpyObj<NbToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const activeState: KillerGameServerState = {
    isActive: true,
    currentPlayerIndex: 0,
    playerRows: [
      { name: 'Alice', livesRemaining: 3, missedInSuddenDeath: false, eliminated: false },
      { name: 'Bob', livesRemaining: 3, missedInSuddenDeath: false, eliminated: false },
    ],
  };

  beforeEach(async () => {
    game$ = new Subject();
    gameEnded$ = new Subject();
    error$ = new Subject();
    disconnected$ = new Subject();
    mockHubConnection = { stop: jasmine.createSpy('stop') };

    mockKillerService = jasmine.createSpyObj(
      'KillerService',
      ['connect', 'pot', 'miss', 'earlyBlackPot', 'undo', 'abandon', 'confirmEnd'],
      {
        game$: game$.asObservable(),
        gameEnded$: gameEnded$.asObservable(),
        error$: error$.asObservable(),
        disconnected$: disconnected$.asObservable(),
      }
    );
    mockKillerService.connect.and.returnValue(mockHubConnection as any);
    mockKillerService.confirmEnd.and.returnValue(of(undefined));

    mockToastrService = jasmine.createSpyObj('NbToastrService', ['danger']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [KillerContainerComponent]
    })
      .overrideComponent(KillerContainerComponent, {
        remove: { imports: [KillerComponent] },
        add: { imports: [MockKillerComponent] }
      })
      .overrideProvider(KillerService, { useValue: mockKillerService })
      .overrideProvider(NbToastrService, { useValue: mockToastrService })
      .overrideProvider(Router, { useValue: mockRouter })
      .compileComponents();

    fixture = TestBed.createComponent(KillerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect to the hub on init', () => {
    expect(mockKillerService.connect).toHaveBeenCalledTimes(1);
  });

  it('should initialise with isActive false', () => {
    expect(component.isActive()).toBeFalse();
  });

  it('should initialise with disconnected false', () => {
    expect(component.disconnected()).toBeFalse();
  });

  it('should set isActive true when game$ emits an active state', () => {
    game$.next(activeState);
    expect(component.isActive()).toBeTrue();
  });

  it('should set isActive false when game$ emits an inactive state', () => {
    game$.next(activeState);
    game$.next({ isActive: false, currentPlayerIndex: 0, playerRows: [] });
    expect(component.isActive()).toBeFalse();
  });

  it('should populate game signal from game$ emission', () => {
    game$.next(activeState);
    expect(component.game()).toEqual(jasmine.objectContaining({
      currentPlayerIndex: 0,
      playerRows: jasmine.arrayContaining([jasmine.objectContaining({ name: 'Alice' })])
    }));
  });

  it('should set disconnected true when disconnected$ emits true', () => {
    disconnected$.next(true);
    expect(component.disconnected()).toBeTrue();
  });

  it('should set disconnected false when disconnected$ emits false', () => {
    disconnected$.next(true);
    disconnected$.next(false);
    expect(component.disconnected()).toBeFalse();
  });

  it('should navigate to /leaderboard when gameEnded$ emits', () => {
    gameEnded$.next();
    expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/leaderboard']);
  });

  it('should show a danger toast when error$ emits', () => {
    error$.next('Something went wrong');
    expect(mockToastrService.danger).toHaveBeenCalledWith('Something went wrong', 'Error');
  });

  it('should stop the hub connection on destroy', () => {
    component.ngOnDestroy();
    expect(mockHubConnection.stop).toHaveBeenCalledTimes(1);
  });

  it('should call service.pot on onPot', () => {
    component.onPot();
    expect(mockKillerService.pot).toHaveBeenCalledTimes(1);
  });

  it('should call service.miss on onMiss', () => {
    component.onMiss();
    expect(mockKillerService.miss).toHaveBeenCalledTimes(1);
  });

  it('should call service.earlyBlackPot on onEarlyBlackPot', () => {
    component.onEarlyBlackPot();
    expect(mockKillerService.earlyBlackPot).toHaveBeenCalledTimes(1);
  });

  it('should call service.undo on onUndo', () => {
    component.onUndo();
    expect(mockKillerService.undo).toHaveBeenCalledTimes(1);
  });

  it('should call service.abandon on onAbandon', () => {
    component.onAbandon();
    expect(mockKillerService.abandon).toHaveBeenCalledTimes(1);
  });

  it('should call service.confirmEnd on onConfirmEnd', () => {
    component.onConfirmEnd();
    expect(mockKillerService.confirmEnd).toHaveBeenCalledTimes(1);
  });

  it('should show a danger toast when confirmEnd fails', () => {
    mockKillerService.confirmEnd.and.returnValue(throwError(() => new Error('server error')));
    component.onConfirmEnd();
    expect(mockToastrService.danger).toHaveBeenCalledOnceWith('Failed to confirm game end', 'Error');
  });
});
