import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { publicTrackingGuard } from './features/public-tracking/guards/public-tracking.guard';

export const routes: Routes = [
  // Rutas públicas de tracking
  {
    path: 'public/tracking/:token',
    loadComponent: () => import('./features/public-tracking/pages/public-tracking-page/public-tracking-page.component').then((m) => m.PublicTrackingPageComponent),
    canActivate: [publicTrackingGuard]
  },
  {
    path: 'public/tracking-expired',
    loadComponent: () => import('./features/public-tracking/pages/tracking-expired/tracking-expired.component').then((m) => m.TrackingExpiredComponent)
  },
  {
    path: 'public/tracking-invalid',
    loadComponent: () => import('./features/public-tracking/pages/tracking-invalid/tracking-invalid.component').then((m) => m.TrackingInvalidComponent)
  },
  {
    path: 'public/tracking-error',
    loadComponent: () => import('./features/public-tracking/pages/tracking-error/tracking-error.component').then((m) => m.TrackingErrorComponent)
  },
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
        path: 'usuarios',
        loadComponent: () => import('./features/users/users.page').then((m) => m.UsersPage)
      },
      {
        path: 'geocercas',
        loadComponent: () => import('./features/geofences/geofences.page').then((m) => m.GeofencesPage)
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
        redirectTo: 'map-view',
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
