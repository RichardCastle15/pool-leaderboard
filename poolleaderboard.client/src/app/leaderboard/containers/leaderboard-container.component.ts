import { Component, OnInit, signal } from '@angular/core';
import { LeaderboardComponent } from '../presenters/leaderboard.component';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntryServer } from '../models/leaderboard-entry-server.model';
import { TreeNode } from '../models/tree-node.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';

@Component({
  selector: 'app-leaderboard-container',
  imports: [LeaderboardComponent],
  templateUrl: './leaderboard-container.component.html',
  styleUrl: './leaderboard-container.component.scss'
})
export class LeaderboardContainerComponent implements OnInit {
  loading = signal(true);
  data = signal<TreeNode<LeaderboardEntryRow | {}>[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<LeaderboardEntryServer[]>('/api/leaderboard').subscribe(result => {
      this.loading.set(false);
      const convertedResult = this.convertServerModel(result);
      this.data.set(convertedResult);
      console.log({result, convertedResult});
    });
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
