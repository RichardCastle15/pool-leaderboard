import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryServer } from '../models/leaderboard-entry-server.model';
import { LeaderboardEntryRow } from '../models/leaderboard-entry-row.model';
import { TreeNode } from '../models/tree-node.model';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let handlers: Record<string, (...args: any[]) => void>;
  let hubConnection: jasmine.SpyObj<HubConnection>;

  beforeEach(() => {
    handlers = {};
    hubConnection = jasmine.createSpyObj<HubConnection>('HubConnection', ['on', 'start', 'stop']);
    hubConnection.on.and.callFake((event: string, handler: (...args: any[]) => void) => {
      handlers[event] = handler;
    });
    hubConnection.start.and.returnValue(Promise.resolve());

    spyOn(HubConnectionBuilder.prototype, 'withUrl').and.callFake(function (this: HubConnectionBuilder) {
      return this;
    });
    spyOn(HubConnectionBuilder.prototype, 'build').and.returnValue(hubConnection);

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), LeaderboardService]
    });

    service = TestBed.inject(LeaderboardService);
    service.connect();
  });

  function receive(entries: LeaderboardEntryServer[]): TreeNode<LeaderboardEntryRow>[] {
    let result: TreeNode<LeaderboardEntryRow>[] = [];
    const sub = service.leaderboard$.subscribe(v => (result = v as TreeNode<LeaderboardEntryRow>[]));
    handlers['ReceiveLeaderboard'](entries);
    sub.unsubscribe();
    return result;
  }

  function rows(result: TreeNode<LeaderboardEntryRow>[]) {
    return result.map(r => r.data as LeaderboardEntryRow);
  }

  it('sorts entries by rating descending regardless of server order', () => {
    const result = receive([
      { id: 1, name: 'Alice', rating: 100 },
      { id: 2, name: 'Bob', rating: 300 },
      { id: 3, name: 'Charlie', rating: 200 }
    ]);
    expect(rows(result).map(r => r.name)).toEqual(['Bob', 'Charlie', 'Alice']);
    expect(rows(result).map(r => r.rank)).toEqual([1, 2, 3]);
  });

  it('maps rating to points and preserves the player id', () => {
    const result = receive([
      { id: 7, name: 'Alice', rating: 1234 }
    ]);
    expect(rows(result)[0]).toEqual({ id: 7, name: 'Alice', points: 1234, rank: 1 });
  });

  it('gives tied entries the same rank and skips the next', () => {
    const result = receive([
      { id: 1, name: 'Alice', rating: 1000 },
      { id: 2, name: 'Bob', rating: 1000 },
      { id: 3, name: 'Charlie', rating: 900 }
    ]);
    expect(rows(result).map(r => r.rank)).toEqual([1, 1, 3]);
  });

  it('handles a run of ties at the top', () => {
    const result = receive([
      { id: 1, name: 'Alice', rating: 1000 },
      { id: 2, name: 'Bob', rating: 1000 },
      { id: 3, name: 'Charlie', rating: 1000 },
      { id: 4, name: 'Dan', rating: 900 }
    ]);
    expect(rows(result).map(r => r.rank)).toEqual([1, 1, 1, 4]);
  });

  it('emits an empty array for an empty leaderboard', () => {
    expect(receive([])).toEqual([]);
  });

  it('does not mutate the server-provided array', () => {
    const input: LeaderboardEntryServer[] = [
      { id: 1, name: 'Alice', rating: 100 },
      { id: 2, name: 'Bob', rating: 300 }
    ];
    const snapshot = [...input];
    receive(input);
    expect(input).toEqual(snapshot);
  });

  it('emits the error message when LeaderboardError fires', () => {
    let message: string | undefined;
    service.error$.subscribe(m => (message = m));
    handlers['LeaderboardError']('something went wrong');
    expect(message).toBe('something went wrong');
  });
});
