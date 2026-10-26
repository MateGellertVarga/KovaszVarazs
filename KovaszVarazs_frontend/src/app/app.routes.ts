import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegistrationPageComponent } from './components/registration-page/registration-page.component';
import { OrdersPageComponent } from './components/orders-page/orders-page.component';
import { ProductsPageComponent } from './components/products-page/products-page.component';
import { ForgotPasswordPageComponent } from './components/forgot-password-page/forgot-password-page.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import {
  adminGuard,
  authGuard,
  guestGuard,
  publicGuard,
  userGuard,
} from './services/auth.guard';
import { PasswordResetPageComponent } from './password-reset-page/password-reset-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'fooldal', pathMatch: 'full' },
  {
    path: 'fooldal',
    component: HomePageComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'bejelentkezes',
    component: LoginPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'regisztracio',
    component: RegistrationPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'elfelejtett-jelszo',
    component: ForgotPasswordPageComponent,
    canActivate: [guestGuard],
  },
  // Az e-mailben kapott tokenes link belépett állapotban is működjön.
  { path: 'uj-jelszo', component: PasswordResetPageComponent },
  {
    path: 'rendeles',
    component: OrdersPageComponent,
    canActivate: [userGuard],
  },
  {
    path: 'termekek',
    component: ProductsPageComponent,
    canActivate: [publicGuard],
  },
  { path: 'user', component: UserPageComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'rendelesek', pathMatch: 'full' },
      {
        path: 'rendelesek',
        loadComponent: () =>
          import(
            './components/admin/admin-orders-page/admin-orders-page.component'
          ).then((m) => m.AdminOrdersPageComponent),
      },
      {
        path: 'sutesek',
        loadComponent: () =>
          import(
            './components/admin/admin-order-schedules-page/admin-order-schedules-page.component'
          ).then((m) => m.AdminOrderSchedulesPageComponent),
      },
      {
        path: 'alap-rendelesek',
        loadComponent: () =>
          import(
            './components/admin/admin-seeds-page/admin-seeds-page.component'
          ).then((m) => m.AdminSeedsPageComponent),
      },
      {
        path: 'termekek',
        loadComponent: () =>
          import(
            './components/admin/admin-products-page/admin-products-page.component'
          ).then((m) => m.AdminProductsPageComponent),
      },
      {
        path: 'receptek',
        loadComponent: () =>
          import(
            './components/admin/admin-recipes-page/admin-recipes-page.component'
          ).then((m) => m.AdminRecipesPageComponent),
      },
      {
        path: 'kassza',
        loadComponent: () =>
          import(
            './components/admin/admin-market-page/admin-market-page.component'
          ).then((m) => m.AdminMarketPageComponent),
      },
      {
        path: 'statisztika',
        loadComponent: () =>
          import(
            './components/admin/admin-statistics-page/admin-statistics-page.component'
          ).then((m) => m.AdminStatisticsPageComponent),
      },
      {
        path: 'felhasznalok',
        loadComponent: () =>
          import(
            './components/admin/admin-users-page/admin-users-page.component'
          ).then((m) => m.AdminUsersPageComponent),
      },
      { path: '**', redirectTo: 'rendelesek' },
    ],
  },
  { path: '**', redirectTo: 'fooldal' },
];
