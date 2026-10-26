import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_NAV_ITEMS } from './admin-nav-items';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    MenubarModule,
    TieredMenuModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  @ViewChild('profileWrap') profileWrap?: ElementRef<HTMLElement>;
  @ViewChild('mobileWrap') mobileWrap?: ElementRef<HTMLElement>;

  dropDownOpen = false;
  mobileMenuOpen = false;
  adminNavItems = ADMIN_NAV_ITEMS;

  // Csak a kijelentkezés után navigálunk, különben a guard még a régi (pl. admin) szerepkört látná.
  logout() {
    this.dropDownOpen = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/fooldal']);
    });
  }

  toggleDropdown() {
    this.dropDownOpen = !this.dropDownOpen;
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  isActive(path: string) {
    return this.router.isActive(path, false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (
      this.dropDownOpen &&
      this.profileWrap &&
      !this.profileWrap.nativeElement.contains(t)
    ) {
      this.dropDownOpen = false;
    }
    if (
      this.mobileMenuOpen &&
      this.mobileWrap &&
      !this.mobileWrap.nativeElement.contains(t)
    ) {
      this.mobileMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(e: Event) {
    if (this.dropDownOpen) this.dropDownOpen = false;
    if (this.mobileMenuOpen) this.mobileMenuOpen = false;
  }
}
