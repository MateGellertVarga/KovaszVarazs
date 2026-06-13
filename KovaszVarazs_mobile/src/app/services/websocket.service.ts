import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

type UnsubscribeFn = () => void;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private echo: Echo<any> | null = null;
  private initializingEcho: Promise<Echo<any>> | null = null;

  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  async listenToPrivateChannel(
    channelName: string,
    eventName: string,
    callback: (payload: any) => void
  ): Promise<UnsubscribeFn> {
    const echo = await this.getEcho();
    const channel = echo.private(channelName);

    channel.listen(eventName, callback);

    return () => {
      channel.stopListening(eventName);
      echo.leave(channelName);
    };
  }

  private async getEcho(): Promise<Echo<any>> {
    if (this.echo) {
      return this.echo;
    }

    if (!this.initializingEcho) {
      this.initializingEcho = this.createEcho().then((echo) => {
        this.echo = echo;
        this.initializingEcho = null;
        return echo;
      });
    }

    return this.initializingEcho;
  }

  private async createEcho(): Promise<Echo<any>> {
    const token = await this.authService.getToken();
    if (!token) {
      throw new Error(
        'Cannot initialize websocket connection without an auth token.'
      );
    }

    const globalWindow = window as Window & { Pusher?: typeof Pusher };
    globalWindow.Pusher = Pusher;
    if (globalWindow.Pusher) {
      try {
        (globalWindow.Pusher as any).logToConsole = true;
      } catch {}
    }
    const keyFromMeta = (import.meta as any)?.env?.VITE_REVERB_APP_KEY;
    const hostFromMeta = (import.meta as any)?.env?.VITE_REVERB_HOST;
    const portFromMeta = (import.meta as any)?.env?.VITE_REVERB_PORT;
    const schemeFromMeta = (import.meta as any)?.env?.VITE_REVERB_SCHEME;

    const key = keyFromMeta || this.configService.reverb.appKey;
    const host = hostFromMeta || this.configService.reverb.host;
    const port = portFromMeta || this.configService.reverb.port;
    const scheme = schemeFromMeta || this.configService.reverb.scheme;

    console.log('websocket.service: using reverb config', {
      key,
      host,
      port,
      scheme,
    });

    if (!key) {
      console.error('websocket.service: no reverb app key available', {
        keyFromMeta,
        config: this.configService.reverb,
      });
      throw new Error(
        'Missing reverb app key — set it in environment or ConfigService.'
      );
    }

    return new Echo<any>({
      broadcaster: 'pusher',
      key,
      cluster: this.configService.reverb.cluster,
      disableStats: true,
      wsHost: host,
      wsPort: Number(port),
      wssPort: Number(port),
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${this.configService.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
}
