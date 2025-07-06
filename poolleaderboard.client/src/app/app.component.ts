import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { NbMenuItem, NbSidebarResponsiveState, NbSidebarState } from '@nebular/theme';
import { environment } from '../environments/environment';
import { NavigationEnd, Router } from '@angular/router';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  public forecasts?: WeatherForecast[];
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
  private connection!: HubConnection;
  items = signal<NbMenuItem[]>([
    {
      title: 'Leaderboard',
      icon: 'list-outline',
    },
    {
      title: 'Killer',
      icon: 'close-circle-outline',
    },
  ]);

  constructor(private router: Router) {}

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
            { title: 'Leaderboard', link: '/showcase/leaderboard'}
          ]
        });
        return items;
      })
    }

    this.router.events.subscribe(routerEvent => {
      if (routerEvent instanceof NavigationEnd)
        this.collapseSidebar();
    });
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
