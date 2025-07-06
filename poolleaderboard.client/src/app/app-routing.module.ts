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
        loadComponent: () => import('./component-showcase/leaderboard/leaderboard-showcase.component').then(m => m.LeaderboardShowcaseComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(environment.production ? prodRoutes : [...prodRoutes, ...developementRoutes])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
