import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { LeaderboardContainerComponent } from './leaderboard/containers/leaderboard-container.component';

const prodRoutes: Routes = [
  {
    path: 'leaderboard',
    component: LeaderboardContainerComponent
  },
  {
    path: 'killer',
    loadComponent: () => import('./killer/killer-container.component').then(m => m.KillerContainerComponent)
  },
  {
    path: 'match-history',
    loadComponent: () => import('./match-history/containers/match-history-container.component').then(m => m.MatchHistoryContainerComponent)
  },
  {
    path: 'players',
    loadComponent: () => import('./player-info/containers/players-container.component').then(m => m.PlayersContainerComponent)
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./player-info/containers/player-info-container.component').then(m => m.PlayerInfoContainerComponent)
  },
];

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
          { path: 'sudden-death', loadComponent: () => import('./component-showcase/killer/sudden-death-killer-showcase.component').then(m => m.SuddenDeathKillerShowcaseComponent) },
          { path: 'disconnected', loadComponent: () => import('./component-showcase/killer/disconnected-killer-showcase.component').then(m => m.DisconnectedKillerShowcaseComponent) },
          { path: 'no-game', loadComponent: () => import('./component-showcase/killer/no-game-killer-showcase.component').then(m => m.NoGameKillerShowcaseComponent) },
        ]
      },
      {
        path: 'match-history',
        children: [
          { path: 'empty', loadComponent: () => import('./component-showcase/match-history/empty-match-history-showcase.component').then(m => m.EmptyMatchHistoryShowcaseComponent) },
          { path: 'mixed', loadComponent: () => import('./component-showcase/match-history/mixed-match-history-showcase.component').then(m => m.MixedMatchHistoryShowcaseComponent) },
          { path: 'last-page-partial', loadComponent: () => import('./component-showcase/match-history/last-page-partial-match-history-showcase.component').then(m => m.LastPagePartialMatchHistoryShowcaseComponent) },
          { path: 'loading', loadComponent: () => import('./component-showcase/match-history/loading-match-history-showcase.component').then(m => m.LoadingMatchHistoryShowcaseComponent) },
        ]
      },
      {
        path: 'player-info',
        children: [
          { path: 'players', loadComponent: () => import('./component-showcase/player-info/players-showcase.component').then(m => m.PlayersShowcaseComponent) },
          { path: 'detail', loadComponent: () => import('./component-showcase/player-info/player-info-showcase.component').then(m => m.PlayerInfoShowcaseComponent) },
        ]
      },
      { path: 'theme-switcher', loadComponent: () => import('./component-showcase/theme-switcher/theme-switcher-showcase.component').then(m => m.ThemeSwitcherShowcaseComponent) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(environment.production ? prodRoutes : [...prodRoutes, ...developmentRoutes])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
