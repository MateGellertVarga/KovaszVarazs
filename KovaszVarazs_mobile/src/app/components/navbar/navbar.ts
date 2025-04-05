import { Component, EnvironmentInjector, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.scss'],
  imports: [
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
})
export class Navbar {
  public environmentInjector = inject(EnvironmentInjector);
  isModalOpen = false;
  showNavbar = true;

  constructor(
    private modalNavbarService: ModalNavbarService,
    private router: Router
  ) {
    this.modalNavbarService.isAnyModalOpen.subscribe((isOpen) => {
      this.isModalOpen = isOpen;
    });
    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/tabs/login', '/tabs/registration'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });
  }
}
