import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntryServer } from '../models/leaderboard-entry-server.model';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { Subscription } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-leaderboard-container',
  imports: [LeaderboardComponent],
  templateUrl: './leaderboard-container.component.html',
  styleUrl: './leaderboard-container.component.scss'
})
export class LeaderboardContainerComponent implements OnInit, OnDestroy {
  loading = signal(true);
  data = signal<TreeNode<LeaderboardEntryRow | {}>[]>([]);
  private subscriptions = new Subscription();
  private hubConnection!: HubConnection;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/leaderboardHub')
      .build();

    this.hubConnection.on('ReceiveLeaderboard', (result: LeaderboardEntryServer[]) => {
      this.loading.set(false);
      this.data.set(this.convertServerModel(result));
    });

    this.hubConnection.start().catch(console.error);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.hubConnection?.stop();
  }

  addParticipant(name: string): void {
    const addSub = this.http.post('/api/leaderboard', {name}).subscribe();
    this.subscriptions.add(addSub);
  }

  private convertServerModel(serverModel: LeaderboardEntryServer[]): TreeNode<LeaderboardEntryRow | {}>[]{
    return serverModel.map(sm => ({data: this.converyServerModelRow(sm), children: []}));
  }

  private converyServerModelRow(serverModel: LeaderboardEntryServer): LeaderboardEntryRow {
    return {
      name: serverModel.name,
      points: serverModel.rating,
      rank: 1,
      id: serverModel.id
    }
  }
}
