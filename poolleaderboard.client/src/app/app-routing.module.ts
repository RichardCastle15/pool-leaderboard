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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(environment.production ? prodRoutes : [...prodRoutes, ...developmentRoutes])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
