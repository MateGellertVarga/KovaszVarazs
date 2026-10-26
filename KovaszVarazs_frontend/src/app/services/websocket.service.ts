import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher, { type ChannelAuthorizationCallback } from 'pusher-js';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

type UnsubscribeFn = () => void;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private echo: Echo<'pusher'> | null = null;
  private channelListenerCounts = new Map<string, number>();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    authService: AuthService,
  ) {
    authService.onLogout(() => this.disconnect());
  }

  listenToPrivateChannel(
    channelName: string,
    eventName: string,
    callback: (payload: any) => void,
  ): UnsubscribeFn {
    const echo = this.getEcho();
    const channel = echo.private(channelName);
    channel.listen(eventName, callback);
    this.channelListenerCounts.set(
      channelName,
      (this.channelListenerCounts.get(channelName) ?? 0) + 1,
    );

    return () => {
      channel.stopListening(eventName, callback);
      const remaining = (this.channelListenerCounts.get(channelName) ?? 1) - 1;
      if (remaining > 0) {
        this.channelListenerCounts.set(channelName, remaining);
      } else {
        this.channelListenerCounts.delete(channelName);
        echo.leave(channelName);
      }
    };
  }

  disconnect() {
    this.echo?.disconnect();
    this.echo = null;
    this.channelListenerCounts.clear();
  }

  private getEcho(): Echo<'pusher'> {
    if (this.echo) {
      return this.echo;
    }

    const { appKey, host, port, scheme, cluster } = this.configService.reverb;
    this.echo = new Echo<'pusher'>({
      broadcaster: 'pusher',
      Pusher,
      key: appKey,
      cluster,
      disableStats: true,
      wsHost: host,
      wsPort: Number(port),
      wssPort: Number(port),
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      // A web cookie-alapú munkamenetet használ (nincs Bearer token), ezért a csatorna
      // authorizációt is a HttpClient végzi, ugyanazokkal az interceptorokkal.
      channelAuthorization: {
        customHandler: ({ socketId, channelName }, callback) =>
          this.authorizeChannel(socketId, channelName, callback),
      },
    });
    return this.echo;
  }

  private authorizeChannel(
    socketId: string,
    channelName: string,
    callback: ChannelAuthorizationCallback,
  ) {
    this.http
      .post<{ auth: string }>(
        `${this.configService.apiUrl}/broadcasting/auth`,
        { socket_id: socketId, channel_name: channelName },
      )
      .subscribe({
        next: (authData) => callback(null, authData),
        error: (error) => {
          console.error(
            'Nem sikerült csatlakozni a websocket csatornához:',
            error,
          );
          callback(error, null);
        },
      });
  }
}
