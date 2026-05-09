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

  startGame(players: { id: number; name: string }[]): Observable<void> {
    return this.http.post<void>('/api/killer', { players });
  }

  confirmEnd(): Observable<void> {
    return this.http.delete<void>('/api/killer');
  }

  pot(): void { this.hubConnection?.invoke('Pot').catch(console.error); }
  miss(): void { this.hubConnection?.invoke('Miss').catch(console.error); }
  earlyBlackPot(): void { this.hubConnection?.invoke('EarlyBlackPot').catch(console.error); }
  undo(): void { this.hubConnection?.invoke('Undo').catch(console.error); }
  abandon(): void { this.hubConnection?.invoke('Abandon').catch(console.error); }

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
