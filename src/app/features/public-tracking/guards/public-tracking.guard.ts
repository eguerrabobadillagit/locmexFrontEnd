import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { PublicTrackingRealtimeService } from '../services/public-tracking-realtime.service';

/**
 * Guard para validar token de tracking público
 * 
 * Flujo:
 * 1. Extrae token del URL
 * 2. Valida con GET /api/public/tracking/{token}
 * 3. Si válido: permite acceso
 * 4. Si inválido/expirado: redirige a página de error
 */
export const publicTrackingGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const trackingService = inject(PublicTrackingRealtimeService);

  const token = route.paramMap.get('token');

  // Si no hay token en la URL
  if (!token) {
    console.error('❌ No se encontró token en la URL');
    router.navigate(['/public/tracking-invalid']);
    return false;
  }

  // Validar token con el backend
  return trackingService.validateToken(token).pipe(
    map(response => {
      console.log('✅ Token válido:', response);
      return true;
    }),
    catchError(error => {
      console.error('❌ Token inválido o expirado:', error);
      
      // Redirigir según el error
      if (error.status === 404) {
        router.navigate(['/public/tracking-expired']);
      } else {
        router.navigate(['/public/tracking-error']);
      }
      
      return of(false);
    })
  );
};
