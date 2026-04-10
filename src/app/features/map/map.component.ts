import { Component, OnInit, ViewChild, OnDestroy, computed, signal, inject, effect } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { VehicleSelectionService } from '../services/vehicle-selection';
import { VehicleDetailComponent } from '../home/components/vehicle-detail/vehicle-detail.component';
import { VehicleWebSocketService } from './service/vehicle-websocket.service';
import { VehicleAnimationService } from './service/vehicle-animation.service';
import { VehicleService, SidebarUnit } from '../vehicles/services/vehicle.service';
import { GeofenceOverlayComponent } from './components/geofence-overlay/geofence-overlay.component';
import { Subscription } from 'rxjs';
import { calculateDistance } from './utils/map.utils';
import { createVehicleMarkerIcon } from './utils/vehicle-marker-icon.util';

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
  private isAutoZooming = false;
  private lastMapMoveTimestamp = 0;
  private readonly MAP_UPDATE_INTERVAL_MS = 5000; // 5 segundos entre movimientos
  private readonly MIN_DISTANCE_TO_MOVE_METERS = 50; // Mover solo si se movió más de 50 metros
  
  selectedVehicleId = signal<string | null>(null);
  showVehicleDetail = signal<boolean>(false);
  showGeofences = signal<boolean>(false);
  autoTrackingEnabled = signal<boolean>(false);
  trackedVehicleId = signal<string | null>(null);
  
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
        icon: createVehicleMarkerIcon(heading, vehicle.status)
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
    private animationService: VehicleAnimationService
  ) {
    // Effect para auto-tracking del vehículo
    effect(() => {
      const vehicles = this.wsService.vehiclesList();
      const isTrackingEnabled = this.autoTrackingEnabled();
      const trackedId = this.trackedVehicleId();
      
      if (isTrackingEnabled && trackedId && vehicles.length > 0) {
        this.centerOnTrackedVehicle();
      }
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.vehicleSelectionService.vehicleSelected$.subscribe(vehicleId => {
        this.focusOnVehicle(vehicleId);
        // Abrir panel de detalles
        this.selectedVehicleId.set(vehicleId);
        this.showVehicleDetail.set(true);
      })
    );

    this.loadVehiclesFromSidebar();
    this.connectToSignalR();
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
      },
      error: (error) => {
        console.error('Error al cargar vehículos desde sidebar-units:', error);
      }
    });
  }

  private mapSidebarUnitToVehicleDetail(unit: SidebarUnit): VehicleDetail {
    return {
      id: unit.vehicleId || unit.deviceId,
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

  private async connectToSignalR(): Promise<void> {
    try {
      await this.wsService.connect();
      
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

  toggleAutoTracking() {
    const newState = !this.autoTrackingEnabled();
    this.autoTrackingEnabled.set(newState);
    
    if (newState) {
      // Al activar, rastrear el primer vehículo disponible
      const vehicles = this.wsService.vehiclesList();
      if (vehicles.length > 0) {
        this.trackedVehicleId.set(vehicles[0].id);
        this.centerOnTrackedVehicle();
        this.setupMapInteractionListeners();
      }
    } else {
      this.trackedVehicleId.set(null);
    }
  }

  private centerOnTrackedVehicle() {
    const trackedId = this.trackedVehicleId();
    if (!trackedId || !this.googleMap?.googleMap) return;
    
    const vehicle = this.wsService.getVehicleById(trackedId);
    if (!vehicle) return;
    
    const now = Date.now();
    const timeSinceLastMove = now - this.lastMapMoveTimestamp;
    
    // Throttle: solo mover si han pasado X segundos desde el último movimiento
    if (timeSinceLastMove < this.MAP_UPDATE_INTERVAL_MS) {
      return;
    }
    
    const map = this.googleMap.googleMap;
    const currentCenter = map.getCenter();
    
    if (currentCenter) {
      // Calcular distancia entre posición actual del mapa y nueva posición del vehículo
      const distance = calculateDistance(
        currentCenter.lat(),
        currentCenter.lng(),
        vehicle.latitude,
        vehicle.longitude
      );
      
      // Solo mover si el vehículo se ha movido una distancia significativa
      if (distance < this.MIN_DISTANCE_TO_MOVE_METERS) {
        return;
      }
    }
    
    const newCenter = { lat: vehicle.latitude, lng: vehicle.longitude };
    
    // Usar panTo para movimiento suave
    map.panTo(newCenter);
    
    // Actualizar timestamp del último movimiento
    this.lastMapMoveTimestamp = now;
  }

  private setupMapInteractionListeners() {
    if (!this.googleMap?.googleMap) return;
    
    const map = this.googleMap.googleMap;
    
    // Desactivar auto-tracking cuando el usuario interactúa con el mapa
    const dragListener = map.addListener('dragstart', () => {
      if (this.autoTrackingEnabled()) {
        this.autoTrackingEnabled.set(false);
      }
    });
    
    const zoomListener = map.addListener('zoom_changed', () => {
      // Solo desactivar si el usuario cambió el zoom manualmente
      // (no si fue por auto-tracking)
      if (this.autoTrackingEnabled() && !this.isAutoZooming) {
        this.autoTrackingEnabled.set(false);
      }
    });
    
    // Limpiar listeners al destruir
    this.subscription.add(() => {
      google.maps.event.removeListener(dragListener);
      google.maps.event.removeListener(zoomListener);
    });
  }

}
