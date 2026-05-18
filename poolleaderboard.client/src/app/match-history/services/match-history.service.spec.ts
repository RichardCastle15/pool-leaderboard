import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { MatchHistoryService } from './match-history.service';
import { MatchHistoryPage } from '../models/match-history.model';

describe('MatchHistoryService', () => {
  let service: MatchHistoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MatchHistoryService
      ]
    });
    service = TestBed.inject(MatchHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls /api/match-history with skip and take query params', () => {
    let result: MatchHistoryPage | undefined;
    service.getPage(20, 10).subscribe(p => (result = p));

    const req = httpMock.expectOne(r =>
      r.url === '/api/match-history' &&
      r.params.get('skip') === '20' &&
      r.params.get('take') === '10'
    );
    expect(req.request.method).toBe('GET');

    const fake: MatchHistoryPage = { total: 0, items: [] };
    req.flush(fake);
    expect(result).toEqual(fake);
  });
});
