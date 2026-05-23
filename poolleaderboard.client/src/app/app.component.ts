import { ChangeDetectionStrategy, Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { NbMenuItem, NbSidebarResponsiveState, NbSidebarState } from '@nebular/theme';
import { environment } from '../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  websocketReady = signal(false);
  sidebarState = signal<NbSidebarState>('collapsed');
  sidebarResponsiveState = signal<NbSidebarResponsiveState | undefined>(undefined);
  showCollpaseSidebar = computed<boolean>(() => {
    const variableSidebarScreen = this.sidebarResponsiveState() === 'mobile' || this.sidebarResponsiveState() === 'tablet';
    return variableSidebarScreen && this.sidebarState() === 'expanded';
  });
  showExpandSidebar = computed<boolean>(() => {
    const mobileExpandable = this.sidebarResponsiveState() === 'mobile' && this.sidebarState() === 'collapsed';
    const tabletExpandable = this.sidebarResponsiveState() === 'tablet' && this.sidebarState() === 'compacted';
    return mobileExpandable || tabletExpandable;
  });
  items = signal<NbMenuItem[]>([
    {
      title: 'Leaderboard',
      icon: 'list-outline',
      link: '/leaderboard'
    },
    {
      title: 'Killer',
      icon: 'close-circle-outline',
      link: '/killer'
    },
    {
      title: 'Match History',
      icon: 'clock-outline',
      link: '/match-history'
    },
    {
      title: 'Players',
      icon: 'person-outline',
      link: '/players'
    },
  ]);

  private subscriptions = new Subscription();
  private connection!: HubConnection;

  constructor(private router: Router, protected themeService: ThemeService) {}

  ngOnInit() {
    this.connection = new HubConnectionBuilder().withUrl("/exampleHub").configureLogging(LogLevel.Debug).build();
    this.connection.on("ReceiveMessage", (message: string) => {
      console.debug({ message });
    });
    this.connection.start()
      .then(() => {
        console.debug('connection start done');
        this.websocketReady.set(true);
      })
      .catch(console.error);

    if (!environment.production) {
      this.items.update(items => {
        items.push({
          title: 'Showcase',
          icon: 'brush-outline',
          children: [
            {
              title: 'Leaderboard',
              children: [
                { title: 'Large', link: '/showcase/leaderboard/large' },
                { title: 'Large - compact', link: '/showcase/leaderboard/large-compact' },
                { title: 'Small', link: '/showcase/leaderboard/small' },
                { title: 'Empty', link: '/showcase/leaderboard/empty' },
                { title: 'Loading', link: '/showcase/leaderboard/loading' },
              ]
            },
            {
              title: 'Killer',
              children: [
                { title: 'New game', link: '/showcase/killer/new-game' },
                { title: 'Two lives', link: '/showcase/killer/two-lives' },
                { title: 'Compact', link: '/showcase/killer/compact' },
                { title: 'Eliminated players', link: '/showcase/killer/eliminated-players' },
                { title: 'Long list', link: '/showcase/killer/long-list' },
                { title: 'Sudden death', link: '/showcase/killer/sudden-death' },
                { title: 'Disconnected', link: '/showcase/killer/disconnected' },
                { title: 'No game', link: '/showcase/killer/no-game' },
              ]
            },
            {
              title: 'Match history',
              children: [
                { title: 'Empty', link: '/showcase/match-history/empty' },
                { title: 'Mixed', link: '/showcase/match-history/mixed' },
                { title: 'Last page partial', link: '/showcase/match-history/last-page-partial' },
                { title: 'Loading', link: '/showcase/match-history/loading' },
              ]
            },
            {
              title: 'Player info',
              children: [
                { title: 'Players list', link: '/showcase/player-info/players' },
                { title: 'Player detail', link: '/showcase/player-info/detail' },
              ]
            },
            { title: 'Theme switcher', link: '/showcase/theme-switcher' },
          ]
        });
        return items;
      })
    }

    const routerSub = this.router.events.subscribe(routerEvent => {
      if (routerEvent instanceof NavigationEnd)
        this.collapseSidebar();
    });
    this.subscriptions.add(routerSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  sendMessage(message: string) {
    this.connection.invoke("SendMessage", message).catch(console.error);
  }

  sidebarStateChange(event: NbSidebarState) {
    this.sidebarState.set(event);
    // Responsive state is not emit on initialisation, so set it if it's currently undefined.
    if (!this.sidebarResponsiveState()) {
      switch (event) {
        case 'expanded':
          this.sidebarResponsiveState.set('pc');
          break;
        case 'collapsed':
          this.sidebarResponsiveState.set('mobile');
          break;
        case 'compacted':
          this.sidebarResponsiveState.set('mobile');
          break;
        default:
          throw new Error(`Recieved unexpected sidebar state: ${event}`);
      }
    }
  }

  sidebarResponsiveChange(event: NbSidebarResponsiveState) {
    this.sidebarResponsiveState.set(event);
  }

  expandSidebar() {
    this.sidebarState.set('expanded');
  }

  collapseSidebar() {
    if (this.sidebarResponsiveState() === 'tablet')
      this.sidebarState.set('compacted');
    else if (this.sidebarResponsiveState() === 'mobile')
      this.sidebarState.set('collapsed');
  }

  title = 'poolleaderboard.client';
}
