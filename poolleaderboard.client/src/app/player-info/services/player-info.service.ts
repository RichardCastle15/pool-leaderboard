import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchHistoryPage } from '../../match-history/models/match-history.model';
import { HeadToHeadRecord } from '../models/player-info.model';

@Injectable({ providedIn: 'root' })
export class PlayerInfoService {
  constructor(private http: HttpClient) {}

  getPlayerMatches(playerId: number, skip: number, take: number): Observable<MatchHistoryPage> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());
    return this.http.get<MatchHistoryPage>(`/api/players/${playerId}/matches`, { params });
  }

  getHeadToHead(playerId: number): Observable<HeadToHeadRecord[]> {
    return this.http.get<HeadToHeadRecord[]>(`/api/players/${playerId}/head-to-head`);
  }
}
