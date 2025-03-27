import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/navbar/tabs.routes').then((m) => m.routes),
  },
];
