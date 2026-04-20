import { Injectable, inject } from '@angular/core';
import { SidebarUnit } from '../../vehicles/services/vehicle.service';
import { VehicleDetail } from '../interfaces/vehicle-detail.interface';
import { VehicleWebSocketService } from './vehicle-websocket.service';
import { VehicleAnimationService } from './vehicle-animation.service';

@Injectable({
  providedIn: 'root'
})
export class MapUtilsService {
  private readonly wsService = inject(VehicleWebSocketService);
  private readonly animationService = inject(VehicleAnimationService);
  private intervalId: any = null;

  mapSidebarUnitToVehicleDetail(unit: SidebarUnit): VehicleDetail {
    return {
      id: unit.vehicleId || unit.deviceId,
      plate: unit.plate,
      status: unit.statusCode,
      model: unit.unitLabel,
      driver: unit.driverName || 'Sin asignar',
      imei: unit.deviceId,
      speed: unit.speedKph || 0,
      fuel: unit.batteryLevel || 0,
      heading: 0,
      motorHours: 0,
      latitude: unit.latitude!,
      longitude: unit.longitude!,
      satellites: 0,
      altitude: 0,
      odometer: 0,
      lastReport: unit.lastMessageAtUtc
    };
  }

  startTelemetryListener(): void {
    // Limpiar intervalo anterior para prevenir duplicados
    this.stopTelemetryListener();

    const vehiclesSignal = this.wsService.vehicles;
    let previousVehicles = new Map<string, VehicleDetail>();

    this.intervalId = setInterval(() => {
      const currentVehicles = vehiclesSignal();

      currentVehicles.forEach((vehicle, id) => {
        const previousVehicle = previousVehicles.get(id);

        if (previousVehicle) {
          const hasPositionChanged =
            previousVehicle.latitude !== vehicle.latitude ||
            previousVehicle.longitude !== vehicle.longitude ||
            previousVehicle.heading !== vehicle.heading;

          if (hasPositionChanged) {
            this.animationService.startAnimation(
              id,
              { latitude: previousVehicle.latitude, longitude: previousVehicle.longitude, heading: previousVehicle.heading },
              { latitude: vehicle.latitude, longitude: vehicle.longitude, heading: vehicle.heading },
              1500
            );
          }
        }
      });

      previousVehicles = new Map(currentVehicles);
    }, 100);
  }

  stopTelemetryListener(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
