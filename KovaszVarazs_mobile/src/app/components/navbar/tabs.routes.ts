import { Routes } from '@angular/router';
import { Navbar } from './navbar';

export const routes: Routes = [
  {
    path: 'tabs',
    component: Navbar,
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('../pages/orders/orders').then((m) => m.default),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('../pages/products/products').then((m) => m.Products),
      },
      {
        path: 'orderSchedules',
        loadComponent: () =>
          import('../pages/orderSchedules/orderSchedules').then(
            (m) => m.OrderSchedules
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('../pages/statistics/statistics').then((m) => m.Statistics),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../pages/login/login').then((m) => m.Login),
      },
      // {
      //   path: 'registration',
      //   loadComponent: () =>
      //     import('../pages/registration/registration').then(
      //       (m) => m.Registration
      //     ),
      // },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/orders',
    pathMatch: 'full',
  },
];
