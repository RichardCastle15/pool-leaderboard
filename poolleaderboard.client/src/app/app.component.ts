import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { NbMenuItem, NbSidebarResponsiveState, NbSidebarState } from '@nebular/theme';

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
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  public forecasts?: WeatherForecast[];
  websocketReady = signal(false);
  sidebarState = signal<NbSidebarState>('collapsed');
  sidebarResponsiveState = signal<NbSidebarResponsiveState>('mobile');
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
  items: NbMenuItem[] = [
    {
      title: 'Leaderboard',
      icon: 'list-outline',
    },
    {
      title: 'Killer',
      icon: 'close-circle-outline',
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getForecasts();
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
  }

  sendMessage(message: string) {
    this.connection.invoke("SendMessage", message).catch(console.error);
  }

  getForecasts() {
    this.http.get<WeatherForecast[]>('/weatherforecast').subscribe(
      (result) => {
        this.forecasts = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  sidebarStateChange(event: NbSidebarState) {
    this.sidebarState.set(event);
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
