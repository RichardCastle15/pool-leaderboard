import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

const prodRoutes: Routes = [];

const developementRoutes: Routes = [
  {
    path: 'showcase',
    children: [
      {
        path: 'leaderboard',
        children: [
          { path: 'large', loadComponent: () => import('./component-showcase/leaderboard/large-leaderboard-showcase.component').then(m => m.LargeLeaderboardShowcaseComponent) },
          { path: 'small', loadComponent: () => import('./component-showcase/leaderboard/small-leaderboard-showcase.component').then(m => m.SmallLeaderboardShowcaseComponent) }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(environment.production ? prodRoutes : [...prodRoutes, ...developementRoutes])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
