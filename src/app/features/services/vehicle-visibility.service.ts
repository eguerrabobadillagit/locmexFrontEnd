import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VehicleVisibilityService {
  // Signal para almacenar los IDs de vehículos visibles
  private visibleVehicleIds = signal<Set<string>>(new Set());

  // Exponer como readonly
  selectedVehicleIds = this.visibleVehicleIds.asReadonly();

  /**
   * Actualiza el conjunto completo de vehículos visibles
   */
  setVisibleVehicles(vehicleIds: Set<string>): void {
    this.visibleVehicleIds.set(new Set(vehicleIds));
  }

  /**
   * Agrega un vehículo a los visibles
   */
  showVehicle(vehicleId: string): void {
    const current = new Set(this.visibleVehicleIds());
    current.add(vehicleId);
    this.visibleVehicleIds.set(current);
  }

  /**
   * Quita un vehículo de los visibles
   */
  hideVehicle(vehicleId: string): void {
    const current = new Set(this.visibleVehicleIds());
    current.delete(vehicleId);
    this.visibleVehicleIds.set(current);
  }

  /**
   * Toggle de visibilidad de un vehículo
   */
  toggleVehicle(vehicleId: string): void {
    const current = new Set(this.visibleVehicleIds());
    if (current.has(vehicleId)) {
      current.delete(vehicleId);
    } else {
      current.add(vehicleId);
    }
    this.visibleVehicleIds.set(current);
  }

  /**
   * Muestra todos los vehículos
   */
  showAll(vehicleIds: string[]): void {
    this.visibleVehicleIds.set(new Set(vehicleIds));
  }

  /**
   * Oculta todos los vehículos
   */
  hideAll(): void {
    this.visibleVehicleIds.set(new Set());
  }

  /**
   * Verifica si un vehículo está visible
   */
  isVisible(vehicleId: string): boolean {
    return this.visibleVehicleIds().has(vehicleId);
  }
}
