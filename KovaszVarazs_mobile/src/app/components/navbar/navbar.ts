import { Component, EnvironmentInjector, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonToolbar,
  IonItem,
  IonMenu,
  IonHeader,
  IonContent,
  IonList,
  IonTitle,
  IonTab,
} from '@ionic/angular/standalone';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.scss'],
  imports: [
    IonTab,
    IonTitle,
    IonList,
    IonContent,
    IonHeader,
    IonItem,
    IonToolbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonMenu,
    IonIcon,
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
    this.modalNavbarService.isModalOpen.subscribe((isOpen) => {
      this.isModalOpen = isOpen;
    });
    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/tabs/login', '/tabs/registration'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });
  }
}
