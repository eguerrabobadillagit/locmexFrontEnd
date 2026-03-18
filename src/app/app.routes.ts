import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.page').then((m) => m.AuthPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehicles/vehicles.page').then((m) => m.VehiclesPage)
      },
      {
        path: 'dispositivos',
        loadComponent: () => import('./features/devices/devices.page').then((m) => m.DevicesPage)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
      },
      {
        path: 'map-view',
        loadComponent: () => import('./features/map/map.component').then((m) => m.MapComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
