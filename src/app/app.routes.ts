import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },

  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },

  {
    path: 'mission/:id',
    loadComponent: () =>
      import('./pages/mission-detail/mission-detail.page').then((m) => m.MissionDetailPage),
  },

  { path: '**', redirectTo: 'auth' },
];
