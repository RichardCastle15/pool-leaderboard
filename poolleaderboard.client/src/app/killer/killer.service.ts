import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { KillerGame } from './types/killer-game.model';

export interface KillerGameServerState {
  isActive: boolean;
  currentPlayerIndex: number;
  playerRows: { name: string; livesRemaining: number; missedInSuddenDeath: boolean; eliminated: boolean }[];
  winner?: string;
}

/** Body of the 409 returned when starting a game while another is in progress. */
export interface KillerGameInProgressResponse {
  message: string;
  players: string[];
  /** Set when the game is over but its result hasn't been confirmed yet. */
  winner?: string | null;
}

@Injectable({ providedIn: 'root' })
export class KillerService {
  private hubConnection?: HubConnection;

  private gameSubject = new Subject<KillerGameServerState>();
  private gameEndedSubject = new Subject<void>();
  private errorSubject = new Subject<string>();
  private disconnectedSubject = new Subject<boolean>();

  game$ = this.gameSubject.asObservable();
  gameEnded$ = this.gameEndedSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  disconnected$ = this.disconnectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(): HubConnection {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/killerHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveKillerGame', (state: KillerGameServerState) => {
      this.gameSubject.next(state);
    });

    this.hubConnection.on('KillerGameEnded', () => {
      this.gameEndedSubject.next();
    });

    this.hubConnection.on('KillerError', (message: string) => {
      this.errorSubject.next(message);
    });

    this.hubConnection.onreconnecting(() => {
      this.disconnectedSubject.next(true);
    });

    this.hubConnection.onreconnected(() => {
      this.disconnectedSubject.next(false);
    });

    this.hubConnection.onclose(() => {
      this.disconnectedSubject.next(true);
    });

    this.hubConnection.start().catch(() => {
      this.errorSubject.next('Failed to connect to game server.');
    });

    return this.hubConnection;
  }

  /** Without `replaceExisting`, the server answers 409 (see KillerGameInProgressResponse) if a game is already in progress. */
  startGame(players: { id: number; name: string }[], replaceExisting = false): Observable<void> {
    return this.http.post<void>('/api/killer', { players, replaceExisting });
  }

  confirmEnd(): Observable<void> {
    return this.http.delete<void>('/api/killer');
  }

  // Each resolves once the hub has handled the call (failures are logged; the hub reports its own errors via KillerError).
  pot(): Promise<void> { return this.invoke('Pot'); }
  miss(): Promise<void> { return this.invoke('Miss'); }
  earlyBlackPot(): Promise<void> { return this.invoke('EarlyBlackPot'); }
  undo(): Promise<void> { return this.invoke('Undo'); }
  abandon(): Promise<void> { return this.invoke('Abandon'); }

  private invoke(methodName: string): Promise<void> {
    if (!this.hubConnection)
      return Promise.resolve();
    return this.hubConnection.invoke<void>(methodName).catch(console.error);
  }

  static toKillerGame(state: KillerGameServerState): KillerGame {
    return {
      currentPlayerIndex: state.currentPlayerIndex,
      playerRows: state.playerRows.map(r => ({
        name: r.name,
        livesRemaining: r.livesRemaining,
        missedInSuddenDeath: r.missedInSuddenDeath,
        eliminated: r.eliminated
      })),
      winner: state.winner
    };
  }
}
