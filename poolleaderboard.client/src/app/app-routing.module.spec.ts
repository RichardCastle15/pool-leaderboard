import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRoutingModule]
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  it('registers a match-history route', () => {
    expect(router.config.some(r => r.path === 'match-history')).toBeTrue();
  });

  it('match-history route uses lazy loading', () => {
    const route = router.config.find(r => r.path === 'match-history')!;
    expect(route.loadComponent).toBeDefined();
  });

  it('registers leaderboard and killer routes', () => {
    const paths = router.config.map(r => r.path);
    expect(paths).toContain('leaderboard');
    expect(paths).toContain('killer');
  });

  describe('in development mode', () => {
    it('includes a showcase route', () => {
      expect(router.config.some(r => r.path === 'showcase')).toBeTrue();
    });

    it('showcase contains a match-history child group', () => {
      const showcase = router.config.find(r => r.path === 'showcase')!;
      const matchHistoryGroup = showcase.children?.find(r => r.path === 'match-history');
      expect(matchHistoryGroup).toBeDefined();
    });

    it('showcase match-history group has all four sub-routes', () => {
      const showcase = router.config.find(r => r.path === 'showcase')!;
      const matchHistoryGroup = showcase.children!.find(r => r.path === 'match-history')!;
      const paths = matchHistoryGroup.children!.map(r => r.path);
      expect(paths).toContain('empty');
      expect(paths).toContain('mixed');
      expect(paths).toContain('last-page-partial');
      expect(paths).toContain('loading');
    });
  });
});
