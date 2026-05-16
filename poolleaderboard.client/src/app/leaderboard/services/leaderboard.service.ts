import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { LeaderboardEntryServer } from '../models/leaderboard-entry-server.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { TreeNode } from '../models/tree-node.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private leaderboardSubject = new Subject<TreeNode<LeaderboardEntryRow | {}>[]>();
  private errorSubject = new Subject<string>();

  leaderboard$: Observable<TreeNode<LeaderboardEntryRow | {}>[]> = this.leaderboardSubject.asObservable();
  error$: Observable<string> = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(): HubConnection {
    const hubConnection = new HubConnectionBuilder()
      .withUrl('/leaderboardHub')
      .build();

    hubConnection.on('ReceiveLeaderboard', (result: LeaderboardEntryServer[]) => {
      this.leaderboardSubject.next(this.convertServerModel(result));
    });

    hubConnection.on('LeaderboardError', (message: string) => {
      this.errorSubject.next(message);
    });

    hubConnection.start().catch(console.error);

    return hubConnection;
  }

  addParticipant(name: string): Observable<Object> {
    return this.http.post('/api/leaderboard', { name });
  }

  recordResult(winnerId: number, loserId: number): Observable<Object> {
    return this.http.post('/api/match', { winnerId, loserId });
  }

  private convertServerModel(serverModel: LeaderboardEntryServer[]): TreeNode<LeaderboardEntryRow | {}>[] {
    const sorted = [...serverModel].sort((a, b) => b.rating - a.rating);
    let lastRating = Number.NaN;
    let lastRank = 0;
    return sorted.map((sm, index) => {
      const rank = sm.rating === lastRating ? lastRank : index + 1;
      lastRating = sm.rating;
      lastRank = rank;
      return {
        data: {
          name: sm.name,
          points: sm.rating,
          rank,
          id: sm.id
        },
        children: []
      };
    });
  }
}
