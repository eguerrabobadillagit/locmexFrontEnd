import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PublicTrackingService } from '../services/public-tracking.service';
import { catchError, map, of } from 'rxjs';

export const publicTokenGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const trackingService = inject(PublicTrackingService);
  
  const token = route.paramMap.get('token');
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Validar el token con el backend
  return trackingService.validateToken(token).pipe(
    map(response => {
      if (response.isValid) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
