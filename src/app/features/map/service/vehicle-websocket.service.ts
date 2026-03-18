import { Injectable, signal, computed, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { VehicleDetail } from '../interfaces/vehicle-detail.interface';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface VehicleUpdate {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  fuel?: number;
  satellites?: number;
  altitude?: number;
  timestamp: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

@Injectable({
  providedIn: 'root'
})
export class VehicleWebSocketService {
  private readonly authService = inject(AuthService);
  private connection: signalR.HubConnection | null = null;
  private readonly hubUrl = `${environment.apiUrl.replace('/api', '')}/hubs/telemetry`;

  connectionStatus = signal<ConnectionStatus>('disconnected');
  
  vehicles = signal<Map<string, VehicleDetail>>(new Map());
  
  error = signal<string | null>(null);

  vehiclesList = computed(() => Array.from(this.vehicles().values()));

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.warn('SignalR already connected');
      return;
    }

    this.connectionStatus.set('connecting');
    this.error.set(null);

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => this.authService.accessToken() || ''
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('telemetry:position', (msg: any) => {
        console.log('[Realtime]', msg);
        this.handleTelemetryMessage(msg);
      });

      this.connection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
        this.connectionStatus.set('connecting');
      });

      this.connection.onreconnected(() => {
        console.log('SignalR reconnected');
        this.connectionStatus.set('connected');
        this.error.set(null);
      });

      this.connection.onclose((error) => {
        console.log('SignalR disconnected', error);
        this.connectionStatus.set('disconnected');
        if (error) {
          this.error.set(error.message || 'Connection closed with error');
        }
      });

      await this.connection.start();
      console.log('SignalR connected');
      this.connectionStatus.set('connected');
      this.error.set(null);
    } catch (err: any) {
      console.error('Failed to connect to SignalR:', err);
      this.connectionStatus.set('error');
      this.error.set(err.message || 'Failed to connect to SignalR hub');
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionStatus.set('disconnected');
    }
  }

  private handleTelemetryMessage(msg: any): void {
    // Filtrar solo mensajes con protocol "teltonika-avl"
    // if (msg.protocol !== 'teltonika-avl') {
    //   return;
    // }

    const update: VehicleUpdate = {
      id: msg.vehicleId || msg.id || msg.imei,
      latitude: msg.latitude || msg.lat,
      longitude: msg.longitude || msg.lng || msg.lon,
      speed: msg.speed || 0,
      heading: msg.heading || msg.course || 0,
      fuel: msg.fuel,
      satellites: msg.satellites || msg.sat,
      altitude: msg.altitude || msg.alt,
      timestamp: msg.timestamp || msg.dateTime || new Date().toISOString()
    };
    
    this.handleVehicleUpdate(update);
  }

  private handleVehicleUpdate(update: VehicleUpdate): void {
    this.vehicles.update(vehiclesMap => {
      const newMap = new Map(vehiclesMap);
      const existingVehicle = newMap.get(update.id);

      const updatedVehicle: VehicleDetail = {
        id: update.id,
        plate: existingVehicle?.plate || `Vehicle-${update.id}`,
        status: this.getStatusFromSpeed(update.speed),
        model: existingVehicle?.model || 'Unknown Model',
        driver: existingVehicle?.driver || 'Unknown Driver',
        imei: existingVehicle?.imei || '',
        speed: update.speed,
        fuel: update.fuel ?? existingVehicle?.fuel ?? 0,
        heading: update.heading,
        motorHours: existingVehicle?.motorHours ?? 0,
        latitude: update.latitude,
        longitude: update.longitude,
        satellites: update.satellites ?? existingVehicle?.satellites ?? 0,
        altitude: update.altitude ?? existingVehicle?.altitude ?? 0,
        odometer: existingVehicle?.odometer ?? 0,
        lastReport: update.timestamp
      };

      newMap.set(update.id, updatedVehicle);
      return newMap;
    });
  }

  private getStatusFromSpeed(speed: number): string {
    if (speed === 0) return 'stopped';
    if (speed > 0) return 'In_route';
    return 'no-signal';
  }


  getVehicleById(id: string): VehicleDetail | undefined {
    return this.vehicles().get(id);
  }

  initializeVehicles(vehicles: VehicleDetail[]): void {
    const vehiclesMap = new Map<string, VehicleDetail>();
    vehicles.forEach(vehicle => {
      vehiclesMap.set(vehicle.id, vehicle);
    });
    this.vehicles.set(vehiclesMap);
  }

}
