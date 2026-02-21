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

  leaderboard$: Observable<TreeNode<LeaderboardEntryRow | {}>[]> = this.leaderboardSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(): HubConnection {
    const hubConnection = new HubConnectionBuilder()
      .withUrl('/leaderboardHub')
      .build();

    hubConnection.on('ReceiveLeaderboard', (result: LeaderboardEntryServer[]) => {
      this.leaderboardSubject.next(this.convertServerModel(result));
    });

    hubConnection.start().catch(console.error);

    return hubConnection;
  }

  addParticipant(name: string): Observable<Object> {
    return this.http.post('/api/leaderboard', { name });
  }

  private convertServerModel(serverModel: LeaderboardEntryServer[]): TreeNode<LeaderboardEntryRow | {}>[] {
    return serverModel.map(sm => ({
      data: {
        name: sm.name,
        points: sm.rating,
        rank: 1,
        id: sm.id
      },
      children: []
    }));
  }
}
