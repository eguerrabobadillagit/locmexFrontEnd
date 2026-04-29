import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobilePanelCoordinatorService {
  // Signal para solicitar cierre del detalle de vehículo en el mapa
  readonly closeVehicleDetailRequested = signal<boolean>(false);
  // Signal para solicitar cierre del historial en el sidebar
  readonly closeHistoryRequested = signal<boolean>(false);

  requestCloseVehicleDetail(): void {
    this.closeVehicleDetailRequested.set(true);
    // Auto-reset para permitir triggers consecutivos
    setTimeout(() => this.closeVehicleDetailRequested.set(false), 0);
  }

  requestCloseHistory(): void {
    this.closeHistoryRequested.set(true);
    setTimeout(() => this.closeHistoryRequested.set(false), 0);
  }
}
