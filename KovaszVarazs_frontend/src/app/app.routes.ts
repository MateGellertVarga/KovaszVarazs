import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegistrationPageComponent } from './components/registration-page/registration-page.component';
import { OrdersPageComponent } from './components/orders-page/orders-page.component';
import { ProductsPageComponent } from './components/products-page/products-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'orders', component: OrdersPageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: '**', redirectTo: 'home' },
];
