import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenubarModule, TieredMenuModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
  menuItems = [
    {
      label: 'Főoldal',
      path: '/home',
    },
    {
      label: 'Termékek',
      path: '/products',
    },
    {
      label: 'Rendelés',
      path: '/orders',
    },
  ];
  dropDownOpen: boolean = false;
  mobileMenuOpen: boolean = false;

  toggleDropdown() {
    this.dropDownOpen = !this.dropDownOpen;
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
