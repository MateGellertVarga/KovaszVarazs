import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegistrationPageComponent } from './components/registration-page/registration-page.component';
import { OrdersPageComponent } from './components/orders-page/orders-page.component';
import { ProductsPageComponent } from './components/products-page/products-page.component';
import { ForgotPasswordPageComponent } from './components/forgot-password-page/forgot-password-page.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'fooldal', pathMatch: 'full' },
  { path: 'fooldal', component: HomePageComponent },
  { path: 'bejelentkezes', component: LoginPageComponent },
  { path: 'regisztracio', component: RegistrationPageComponent },
  { path: 'elfelejtett-jelszo', component: ForgotPasswordPageComponent },
  {
    path: 'rendeles',
    component: OrdersPageComponent,
    canActivate: [authGuard],
  },
  { path: 'termekek', component: ProductsPageComponent },
  { path: 'user', component: UserPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'fooldal' },
];
