import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";

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
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public forecasts?: WeatherForecast[];
  websocketReady = signal(false);
  private connection!: HubConnection;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getForecasts();
    this.connection = new HubConnectionBuilder().withUrl("/exampleHub").configureLogging(LogLevel.Debug).build();
    this.connection.on("ReceiveMessage", (message: string) => {
      console.log({ message });
    });
    this.connection.start()
      .then(() => {
        console.log('connection start done');
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

  title = 'poolleaderboard.client';
}
