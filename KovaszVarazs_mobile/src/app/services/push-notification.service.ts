import { Injectable, Injector } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(private injector: Injector, private router: Router) {}

  initPush() {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        'Push értesítések csak natív eszközön (Android/iOS) működnek.'
      );
      return;
    }

    this.registerPushNotifications();
  }

  private async registerPushNotifications() {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('A felhasználó elutasította a push értesítéseket.');
      return;
    }

    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM Token létrejött:', token.value);
      const authService = this.injector.get(AuthService);
      authService.saveFcmToken(token.value).subscribe({
        next: () =>
          console.log('FCM token sikeresen mentve a Laravel adatbázisba.'),
        error: (err) =>
          console.error(
            'Nem sikerült elmenteni az FCM tokent a backendre:',
            err
          ),
      });
    });

    await PushNotifications.addListener('registrationError', (err: any) => {
      console.error('Hiba történt a Firebase regisztráció során:', err);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push értesítés érkezett (Foreground mód):', notification);
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log(
          'A felhasználó rákattintott az értesítésre:',
          action.notification
        );
        this.router.navigate(['/tabs/orderSchedules']);
      }
    );
    await PushNotifications.register();
  }
}
