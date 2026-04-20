import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeofenceVisibilityService {
  // Signal para almacenar los IDs de geocercas visibles
  private visibleGeofenceIds = signal<Set<string>>(new Set());

  // Signal para override general de visibilidad (interruptor del fab-button)
  private _geofenceVisibilityEnabled = signal<boolean>(true);

  // Exponer como readonly
  selectedGeofenceIds = this.visibleGeofenceIds.asReadonly();
  geofenceVisibilityEnabled = this._geofenceVisibilityEnabled.asReadonly();

  /**
   * Actualiza el conjunto completo de geocercas visibles
   */
  setVisibleGeofences(geofenceIds: Set<string>): void {
    this.visibleGeofenceIds.set(new Set(geofenceIds));
  }

  /**
   * Agrega una geocerca a las visibles
   */
  showGeofence(geofenceId: string): void {
    const current = new Set(this.visibleGeofenceIds());
    current.add(geofenceId);
    this.visibleGeofenceIds.set(current);
  }

  /**
   * Quita una geocerca de las visibles
   */
  hideGeofence(geofenceId: string): void {
    const current = new Set(this.visibleGeofenceIds());
    current.delete(geofenceId);
    this.visibleGeofenceIds.set(current);
  }

  /**
   * Toggle de visibilidad de una geocerca
   */
  toggleGeofence(geofenceId: string): void {
    const current = new Set(this.visibleGeofenceIds());
    if (current.has(geofenceId)) {
      current.delete(geofenceId);
    } else {
      current.add(geofenceId);
    }
    this.visibleGeofenceIds.set(current);
  }

  /**
   * Muestra todas las geocercas
   */
  showAll(geofenceIds: string[]): void {
    console.log('[GeofenceVisibilityService] showAll called with:', geofenceIds);
    this.visibleGeofenceIds.set(new Set(geofenceIds));
    console.log('[GeofenceVisibilityService] Visible geofences after showAll:', Array.from(this.visibleGeofenceIds()));
  }

  /**
   * Oculta todas las geocercas
   */
  hideAll(): void {
    console.log('[GeofenceVisibilityService] hideAll called');
    this.visibleGeofenceIds.set(new Set());
    console.log('[GeofenceVisibilityService] Visible geofences after hideAll:', Array.from(this.visibleGeofenceIds()));
  }

  /**
   * Verifica si una geocerca está visible
   */
  isVisible(geofenceId: string): boolean {
    return this.visibleGeofenceIds().has(geofenceId) && this._geofenceVisibilityEnabled();
  }

  /**
   * Interruptor general de visibilidad de geocercas (fab-button)
   */
  toggleGeofenceVisibility(): void {
    const currentState = this._geofenceVisibilityEnabled();
    this._geofenceVisibilityEnabled.set(!currentState);
    console.log('[GeofenceVisibilityService] Geofence visibility toggled:', !currentState);
  }

  /**
   * Habilitar visibilidad general de geocercas
   */
  enableGeofenceVisibility(): void {
    this._geofenceVisibilityEnabled.set(true);
  }

  /**
   * Deshabilitar visibilidad general de geocercas
   */
  disableGeofenceVisibility(): void {
    this._geofenceVisibilityEnabled.set(false);
  }

  /**
   * Obtener geocercas realmente visibles (considerando el override)
   */
  getActuallyVisibleGeofences(): Set<string> {
    if (!this._geofenceVisibilityEnabled()) {
      return new Set();
    }
    return this.visibleGeofenceIds();
  }
}
