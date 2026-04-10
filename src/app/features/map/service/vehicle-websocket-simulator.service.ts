import { Injectable, signal } from '@angular/core';
import { VehicleUpdate } from './vehicle-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleWebSocketSimulatorService {
  private intervalId: any = null;
  private simulatedVehicles: Map<string, SimulatedVehicle> = new Map();
  
  isRunning = signal<boolean>(false);

  startSimulation(onUpdate: (update: VehicleUpdate) => void, intervalMs: number = 2000): void {
    if (this.intervalId) {
      console.warn('Simulation already running');
      return;
    }

    this.initializeSimulatedVehicles();
    this.isRunning.set(true);

    this.intervalId = setInterval(() => {
      this.simulatedVehicles.forEach((vehicle, id) => {
        this.updateVehiclePosition(vehicle);
        
        const update: VehicleUpdate = {
          id,
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          speed: vehicle.speed,
          heading: vehicle.heading,
          fuel: vehicle.fuel,
          satellites: vehicle.satellites,
          altitude: vehicle.altitude,
          timestamp: new Date().toISOString()
        };

        onUpdate(update);
      });
    }, intervalMs);

  }

  stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning.set(false);

    }
  }

  private initializeSimulatedVehicles(): void {
    this.simulatedVehicles.set('1', {
      latitude: 23.2494,
      longitude: -106.4111,
      speed: 45,
      heading: 90,
      fuel: 85,
      satellites: 10,
      altitude: 8,
      direction: { lat: 0.0001, lng: 0.0002 }
    });

    this.simulatedVehicles.set('2', {
      latitude: 23.2594,
      longitude: -106.4211,
      speed: 65,
      heading: 180,
      fuel: 62,
      satellites: 12,
      altitude: 10,
      direction: { lat: -0.0002, lng: 0.0001 }
    });

    this.simulatedVehicles.set('3', {
      latitude: 23.2394,
      longitude: -106.4011,
      speed: 30,
      heading: 270,
      fuel: 45,
      satellites: 8,
      altitude: 5,
      direction: { lat: 0.0001, lng: -0.0002 }
    });
  }

  private updateVehiclePosition(vehicle: SimulatedVehicle): void {
    vehicle.latitude += vehicle.direction.lat;
    vehicle.longitude += vehicle.direction.lng;

    if (Math.random() > 0.9) {
      vehicle.direction.lat = (Math.random() - 0.5) * 0.0004;
      vehicle.direction.lng = (Math.random() - 0.5) * 0.0004;
      
      vehicle.heading = Math.atan2(vehicle.direction.lng, vehicle.direction.lat) * (180 / Math.PI);
      if (vehicle.heading < 0) vehicle.heading += 360;
    }

    vehicle.speed = Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10);
    vehicle.fuel = Math.max(0, vehicle.fuel - 0.1);
  }
}

interface SimulatedVehicle {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  fuel: number;
  satellites: number;
  altitude: number;
  direction: { lat: number; lng: number };
}
