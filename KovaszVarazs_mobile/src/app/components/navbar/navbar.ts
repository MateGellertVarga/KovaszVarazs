import { Component, EnvironmentInjector, inject, Input } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class Navbar {
  public environmentInjector = inject(EnvironmentInjector);
  isModalOpen = false;

  constructor(private modalNavbarService: ModalNavbarService) {
    this.modalNavbarService.isAnyModalOpen.subscribe((isOpen) => {
      this.isModalOpen = isOpen;
    });
  }
}
