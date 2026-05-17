import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchHistoryPage } from '../models/match-history.model';

@Injectable({ providedIn: 'root' })
export class MatchHistoryService {
  constructor(private http: HttpClient) {}

  getPage(skip: number, take: number): Observable<MatchHistoryPage> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());
    return this.http.get<MatchHistoryPage>('/api/match-history', { params });
  }
}
