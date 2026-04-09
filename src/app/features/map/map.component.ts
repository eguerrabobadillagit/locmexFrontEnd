import { Component, OnInit, ViewChild, OnDestroy, computed, signal, inject } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { VehicleSelectionService } from '../services/vehicle-selection';
import { VehicleDetailComponent } from '../home/components/vehicle-detail/vehicle-detail.component';
import { VehicleWebSocketService } from './service/vehicle-websocket.service';
import { VehicleWebSocketSimulatorService } from './service/vehicle-websocket-simulator.service';
import { VehicleAnimationService } from './service/vehicle-animation.service';
import { VehicleService, SidebarUnit } from '../vehicles/services/vehicle.service';
import { GeofenceOverlayComponent } from './components/geofence-overlay/geofence-overlay.component';
import { Subscription } from 'rxjs';

import { VehicleDetail } from './interfaces/vehicle-detail.interface';

interface VehicleMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  icon: google.maps.Icon;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker, VehicleDetailComponent, IonicModule, GeofenceOverlayComponent]
})
export class MapComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private useSimulator = false;
  
  selectedVehicleId = signal<string | null>(null);
  showVehicleDetail = signal<boolean>(false);
  showGeofences = signal<boolean>(false);
  
  center: google.maps.LatLngLiteral = {
    lat: 23.2494,
    lng: -106.4111
  };

  zoom = 13;

  selectedVehicleDetail = computed(() => {
    const id = this.selectedVehicleId();
    if (!id) return null;
    return this.wsService.getVehicleById(id) || null;
  });

  private getColorByStatus(status: string): { stroke: string; fill: string; filterId: string } {
    switch (status) {
      case 'In_route':
      case 'moving':
        return { stroke: '#4CAF50', fill: '#4CAF50', filterId: 'shadowGreen' };
      case 'stopped':
      case 'idle':
        return { stroke: '#FF9800', fill: '#FF9800', filterId: 'shadowOrange' };
      case 'no-signal':
      case 'offline':
        return { stroke: '#F44336', fill: '#F44336', filterId: 'shadowRed' };
      default:
        return { stroke: '#9E9E9E', fill: '#9E9E9E', filterId: 'shadowGray' };
    }
  }

  private createRotatedIcon(heading: number, status: string): google.maps.Icon {
    const colors = this.getColorByStatus(status);
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <filter id="${colors.filterId}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
          </filter>
        </defs>
        <g transform="rotate(${heading} 32 32)" filter="url(#${colors.filterId})">
          <circle cx="32" cy="32" r="28" fill="#ffffff" stroke="${colors.stroke}" stroke-width="4"/>
          <path d="M20 18 L46 32 L20 46 L26 32 Z" fill="${colors.fill}"/>
        </g>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(44, 44),
      anchor: new google.maps.Point(22, 22)
    };
  }

  markers = computed(() => {
    const animatedPositions = this.animationService.animatedPositions();
    
    return this.wsService.vehiclesList().map(vehicle => {
      const animatedPos = animatedPositions.get(vehicle.id);
      
      const position = animatedPos 
        ? { lat: animatedPos.latitude, lng: animatedPos.longitude }
        : { lat: vehicle.latitude, lng: vehicle.longitude };
      
      const heading = animatedPos ? animatedPos.heading : vehicle.heading;
      
      return {
        id: vehicle.id,
        position,
        title: vehicle.plate,
        icon: this.createRotatedIcon(heading, vehicle.status)
      };
    });
  });

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
  };

  @ViewChild(GoogleMap) googleMap!: GoogleMap;

  private readonly vehicleService = inject(VehicleService);

  constructor(
    private vehicleSelectionService: VehicleSelectionService,
    private wsService: VehicleWebSocketService,
    private simulator: VehicleWebSocketSimulatorService,
    private animationService: VehicleAnimationService
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.vehicleSelectionService.vehicleSelected$.subscribe(vehicleId => {
        this.focusOnVehicle(vehicleId);
      })
    );

    this.loadVehiclesFromSidebar();
    
    if (this.useSimulator) {
      this.startSimulation();
    } else {
      this.connectToSignalR();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.wsService.disconnect();
    this.animationService.stopAllAnimations();
  }

  private loadVehiclesFromSidebar(): void {
    this.vehicleService.getSidebarUnits().subscribe({
      next: (sidebarUnits: SidebarUnit[]) => {
        const vehicles: VehicleDetail[] = sidebarUnits
          .filter(unit => unit.latitude !== null && unit.longitude !== null)
          .map(unit => this.mapSidebarUnitToVehicleDetail(unit));
        
        this.wsService.initializeVehicles(vehicles);
        console.log(`Cargados ${vehicles.length} vehículos desde sidebar-units`);
      },
      error: (error) => {
        console.error('Error al cargar vehículos desde sidebar-units:', error);
        // Fallback a datos iniciales si falla
        this.initializeVehicles();
      }
    });
  }

  private mapSidebarUnitToVehicleDetail(unit: SidebarUnit): VehicleDetail {
    return {
      id: unit.deviceId,
      plate: unit.plate,
      status: unit.statusCode,
      model: unit.unitLabel,
      driver: unit.driverName || 'Sin asignar',
      imei: unit.deviceId,
      speed: unit.speedKph || 0,
      fuel: unit.batteryLevel || 0,
      heading: 0, // No viene en sidebar-units, se actualizará con WebSocket
      motorHours: 0,
      latitude: unit.latitude!,
      longitude: unit.longitude!,
      satellites: 0,
      altitude: 0,
      odometer: 0,
      lastReport: unit.lastMessageAtUtc
    };
  }

  private initializeVehicles(): void {
    const initialVehicles: VehicleDetail[] = [
      {
        id: '1',
        plate: 'ABC-123-CD',
        status: 'In_route',
        model: 'Mercedes Sprinter 2022',
        driver: 'Juan Pérez',
        imei: '867584036912345',
        speed: 45,
        fuel: 85,
        heading: 90,
        motorHours: 987.0,
        latitude: 23.2494,
        longitude: -106.4111,
        satellites: 10,
        altitude: 8,
        odometer: 32145,
        lastReport: new Date().toISOString()
      },
      {
        id: '2',
        plate: 'DEF-456-GH',
        status: 'In_route',
        model: 'Ford Transit 2021',
        driver: 'María García',
        imei: '867584036912346',
        speed: 65,
        fuel: 62,
        heading: 180,
        motorHours: 1234.5,
        latitude: 23.2594,
        longitude: -106.4211,
        satellites: 12,
        altitude: 10,
        odometer: 45678,
        lastReport: new Date().toISOString()
      },
      {
        id: '3',
        plate: 'IJK-789-LM',
        status: 'In_route',
        model: 'Chevrolet Express 2023',
        driver: 'Carlos López',
        imei: '867584036912347',
        speed: 30,
        fuel: 45,
        heading: 270,
        motorHours: 567.8,
        latitude: 23.2394,
        longitude: -106.4011,
        satellites: 8,
        altitude: 5,
        odometer: 15234,
        lastReport: new Date().toISOString()
      }
    ];

    this.wsService.initializeVehicles(initialVehicles);
  }

  private async connectToSignalR(): Promise<void> {
    try {
      await this.wsService.connect();
      console.log('Conectado a SignalR Hub de Telemetría');
      
      this.setupTelemetryListener();
    } catch (error) {
      console.error('Error conectando a SignalR:', error);
    }
  }

  private setupTelemetryListener(): void {
    const vehiclesSignal = this.wsService.vehicles;
    
    let previousVehicles = new Map<string, VehicleDetail>();
    
    setInterval(() => {
      const currentVehicles = vehiclesSignal();
      
      currentVehicles.forEach((vehicle, id) => {
        const previousVehicle = previousVehicles.get(id);
        
        if (previousVehicle) {
          const hasPositionChanged = 
            previousVehicle.latitude !== vehicle.latitude ||
            previousVehicle.longitude !== vehicle.longitude ||
            previousVehicle.heading !== vehicle.heading;
          
          if (hasPositionChanged) {
            const currentPosition = {
              latitude: previousVehicle.latitude,
              longitude: previousVehicle.longitude,
              heading: previousVehicle.heading
            };

            const targetPosition = {
              latitude: vehicle.latitude,
              longitude: vehicle.longitude,
              heading: vehicle.heading
            };

            this.animationService.startAnimation(
              id,
              currentPosition,
              targetPosition,
              1500
            );
          }
        }
      });
      
      previousVehicles = new Map(currentVehicles);
    }, 100);
  }

  private startSimulation(): void {
    this.simulator.startSimulation((update) => {
      const existingVehicle = this.wsService.getVehicleById(update.id);
      if (existingVehicle) {
        const currentPosition = {
          latitude: existingVehicle.latitude,
          longitude: existingVehicle.longitude,
          heading: existingVehicle.heading
        };

        const targetPosition = {
          latitude: update.latitude,
          longitude: update.longitude,
          heading: update.heading
        };

        this.animationService.startAnimation(
          update.id,
          currentPosition,
          targetPosition,
          2000
        );

        this.wsService.vehicles.update(vehiclesMap => {
          const newMap = new Map(vehiclesMap);
          const updatedVehicle: VehicleDetail = {
            ...existingVehicle,
            latitude: update.latitude,
            longitude: update.longitude,
            speed: update.speed,
            heading: update.heading,
            fuel: update.fuel ?? existingVehicle.fuel,
            satellites: update.satellites ?? existingVehicle.satellites,
            altitude: update.altitude ?? existingVehicle.altitude,
            lastReport: update.timestamp
          };
          newMap.set(update.id, updatedVehicle);
          return newMap;
        });
      }
    }, 2000);
  }

  focusOnVehicle(vehicleId: string) {
    const marker = this.markers().find((m: VehicleMarker) => m.id === vehicleId);
    if (marker && this.googleMap && this.googleMap.googleMap) {
      const map = this.googleMap.googleMap;
      map.setCenter(marker.position);
      map.setZoom(17);
    }
  }

  onMarkerClick(markerId: string) {
    const vehicleData = this.wsService.getVehicleById(markerId);
    if (vehicleData) {
      this.selectedVehicleId.set(markerId);
      this.showVehicleDetail.set(true);
    }
  }

  onCloseVehicleDetail() {
    this.showVehicleDetail.set(false);
    this.selectedVehicleId.set(null);
  }

  toggleGeofences() {
    const newState = !this.showGeofences();
    this.showGeofences.set(newState);
  }

}
