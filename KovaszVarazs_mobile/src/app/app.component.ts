import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  tap: number = 0;
  public environmentInjector = inject(EnvironmentInjector);
  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private toastController: ToastController
  ) {
    this.platform.ready().then(() => {
      this.exitAppOnDoubleTap();
      this.resumeApp();
    });

    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: '#ffffff' });
  }

  async ngOnInit() {
    await Keyboard.setScroll({ isDisabled: false });

    const user = await this.authService.getUserData();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/tabs/login']);
    }
  }

  exitAppOnDoubleTap() {
    if (Capacitor.getPlatform() == 'android') {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        this.tap++;
        if (this.tap == 2) App.exitApp();
        else {
          this.doubleTapExitToast();
        }
      });
    }
  }

  async doubleTapExitToast() {
    let toast = await this.toastController.create({
      message: 'Koppints kétszer a kilépéshez!',
      duration: 3000,
      position: 'bottom',
      color: 'primary',
    });
    toast.present();
    const dismiss = await toast.onDidDismiss();
    if (dismiss) {
      this.tap = 0;
    }
  }

  resumeApp() {
    this.platform.resume.subscribe(async () => {
      if (this.router.url.includes('/tabs/orders')) {
        this.router
          .navigateByUrl('/tabs/products', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['/tabs/orders']);
          });
      }
    });
  }
}
