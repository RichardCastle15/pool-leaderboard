import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

const prodRoutes: Routes = [];

const developmentRoutes: Routes = [
  {
    path: 'showcase',
    children: [
      {
        path: 'leaderboard',
        children: [
          { path: 'large', loadComponent: () => import('./component-showcase/leaderboard/large-leaderboard-showcase.component').then(m => m.LargeLeaderboardShowcaseComponent) },
          { path: 'large-compact', loadComponent: () => import('./component-showcase/leaderboard/large-compact-leaderboard-showcase.component').then(m => m.LargeCompactLeaderboardShowcaseComponent) },
          { path: 'small', loadComponent: () => import('./component-showcase/leaderboard/small-leaderboard-showcase.component').then(m => m.SmallLeaderboardShowcaseComponent) },
          { path: 'empty', loadComponent: () => import('./component-showcase/leaderboard/empty-leaderboard-showcase.component').then(m => m.EmptyLeaderboardShowcaseComponent) },
          { path: 'loading', loadComponent: () => import('./component-showcase/leaderboard/loading-leaderboard-showcase.component').then(m => m.LoadingLeaderboardShowcaseComponent) },
        ]
      },
      {
        path: 'killer',
        children: [
          { path: 'new-game', loadComponent: () => import('./component-showcase/killer/new-game-killer-showcase.component').then(m => m.NewGameKillerShowcaseComponent) },
          { path: 'two-lives', loadComponent: () => import('./component-showcase/killer/two-lives-killer-showcase.component').then(m => m.TwoLivesKillerShowcaseComponent) },
          { path: 'compact', loadComponent: () => import('./component-showcase/killer/compact-killer-showcase.component').then(m => m.CompactKillerShowcaseComponent) },
          { path: 'eliminated-players', loadComponent: () => import('./component-showcase/killer/eliminated-players-killer-showcase.component').then(m => m.EliminatedPlayersKillerShowcaseComponent) },
          { path: 'long-list', loadComponent: () => import('./component-showcase/killer/long-list-killer-showcase.component').then(m => m.LongListKillerShowcaseComponent) },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(environment.production ? prodRoutes : [...prodRoutes, ...developmentRoutes])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
