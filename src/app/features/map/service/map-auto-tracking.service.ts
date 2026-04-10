import { Injectable, signal, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { VehicleWebSocketService } from './vehicle-websocket.service';
import { calculateDistance } from '../utils/map.utils';

@Injectable({
  providedIn: 'root'
})
export class MapAutoTrackingService {
  private readonly wsService = inject(VehicleWebSocketService);
  private subscription = new Subscription();

  autoTrackingEnabled = signal<boolean>(false);
  trackedVehicleId = signal<string | null>(null);

  private isAutoZooming = false;
  private lastMapMoveTimestamp = 0;
  private readonly MAP_UPDATE_INTERVAL_MS = 5000;
  private readonly MIN_DISTANCE_TO_MOVE_METERS = 50;

  get isTrackingEnabled(): boolean {
    return this.autoTrackingEnabled();
  }

  get currentTrackedVehicleId(): string | null {
    return this.trackedVehicleId();
  }

  toggleTracking(): boolean {
    const newState = !this.autoTrackingEnabled();
    this.autoTrackingEnabled.set(newState);

    if (newState) {
      const vehicles = this.wsService.vehiclesList();
      if (vehicles.length > 0) {
        this.trackedVehicleId.set(vehicles[0].id);
        return true;
      }
    } else {
      this.trackedVehicleId.set(null);
    }
    return false;
  }

  setTrackedVehicle(vehicleId: string | null): void {
    this.trackedVehicleId.set(vehicleId);
    if (vehicleId && !this.autoTrackingEnabled()) {
      this.autoTrackingEnabled.set(true);
    }
  }

  disableTracking(): void {
    this.autoTrackingEnabled.set(false);
  }

  centerOnTrackedVehicle(map: google.maps.Map | undefined): boolean {
    const trackedId = this.trackedVehicleId();
    if (!trackedId || !map) return false;

    const vehicle = this.wsService.getVehicleById(trackedId);
    if (!vehicle) return false;

    const now = Date.now();
    const timeSinceLastMove = now - this.lastMapMoveTimestamp;

    if (timeSinceLastMove < this.MAP_UPDATE_INTERVAL_MS) {
      return false;
    }

    const currentCenter = map.getCenter();

    if (currentCenter) {
      const distance = calculateDistance(
        currentCenter.lat(),
        currentCenter.lng(),
        vehicle.latitude,
        vehicle.longitude
      );

      if (distance < this.MIN_DISTANCE_TO_MOVE_METERS) {
        return false;
      }
    }

    const newCenter = { lat: vehicle.latitude, lng: vehicle.longitude };
    map.panTo(newCenter);
    this.lastMapMoveTimestamp = now;
    return true;
  }

  setupMapInteractionListeners(
    map: google.maps.Map | undefined,
    onInteraction: () => void
  ): (() => void) | null {
    if (!map) return null;

    const dragListener = map.addListener('dragstart', () => {
      if (this.autoTrackingEnabled()) {
        onInteraction();
      }
    });

    const zoomListener = map.addListener('zoom_changed', () => {
      if (this.autoTrackingEnabled() && !this.isAutoZooming) {
        onInteraction();
      }
    });

    return () => {
      google.maps.event.removeListener(dragListener);
      google.maps.event.removeListener(zoomListener);
    };
  }

  throttledPanTo(
    map: google.maps.Map,
    lat: number,
    lng: number,
    lastTimestamp: number,
    intervalMs: number
  ): { panned: boolean; newTimestamp: number } {
    const now = Date.now();
    if (now - lastTimestamp >= intervalMs) {
      map.panTo({ lat, lng });
      return { panned: true, newTimestamp: now };
    }
    return { panned: false, newTimestamp: lastTimestamp };
  }

  cleanup(): void {
    this.subscription.unsubscribe();
    this.trackedVehicleId.set(null);
    this.autoTrackingEnabled.set(false);
  }
}
