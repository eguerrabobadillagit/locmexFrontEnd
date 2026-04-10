import { Component, OnInit, ViewChild, OnDestroy, computed, signal, inject, effect } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { VehicleSelectionService } from '../services/vehicle-selection';
import { VehicleDetailComponent } from '../home/components/vehicle-detail/vehicle-detail.component';
import { VehicleWebSocketService } from './service/vehicle-websocket.service';
import { VehicleAnimationService } from './service/vehicle-animation.service';
import { VehicleService, SidebarUnit } from '../vehicles/services/vehicle.service';
import { GeofenceOverlayComponent } from './components/geofence-overlay/geofence-overlay.component';
import { RoutePlaybackService } from './service/route-playback.service';
import { RoutePlaybackPlayerComponent } from './components/route-playback-player/route-playback-player.component';
import { MapRouteOverlayService } from './service/map-route-overlay.service';
import { MapUtilsService } from './service/map-utils.service';
import { MapPlaybackMobileService } from './service/map-playback-mobile.service';
import { MapAutoTrackingService } from './service/map-auto-tracking.service';
import { Subscription } from 'rxjs';

import { createVehicleMarkerIcon } from './utils/vehicle-marker-icon.util';
import { addIcons } from 'ionicons';
import { chevronUpOutline, chevronDownOutline, closeOutline, locationOutline, eyeOutline, eyeOffOutline, navigate, navigateOutline } from 'ionicons/icons';

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
  imports: [CommonModule, GoogleMap, MapMarker, VehicleDetailComponent, IonFab, IonFabButton, IonIcon, GeofenceOverlayComponent, RoutePlaybackPlayerComponent]
})
export class MapComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private cleanupMapListeners: (() => void) | null = null;
  private lastPlaybackPanTimestamp = 0;
  private readonly PLAYBACK_PAN_INTERVAL_MS = 2000;

  selectedVehicleId = signal<string | null>(null);
  showVehicleDetail = signal<boolean>(false);
  showGeofences = signal<boolean>(false);
  isMobileScreen = signal<boolean>(window.innerWidth <= 768);
  private resizeListener = () => this.isMobileScreen.set(window.innerWidth <= 768);

  // Delegar señales de playback móvil al servicio
  sheetExpanded = computed(() => this.mobilePlaybackService.sheetExpanded());
  playbackSpeed = computed(() => this.mobilePlaybackService.playbackSpeed());
  mobilePlaybackPoints = computed(() => this.mobilePlaybackService.mobilePlaybackPoints());
  mobileCurrentPointIndex = computed(() => this.mobilePlaybackService.mobileCurrentPointIndex());
  isPlaybackPlaying = computed(() => this.mobilePlaybackService.isPlaybackPlaying());

  // Delegar señales de auto-tracking al servicio
  autoTrackingEnabled = computed(() => this.autoTrackingService.isTrackingEnabled);
  trackedVehicleId = computed(() => this.autoTrackingService.currentTrackedVehicleId);

  showMobilePlayer = computed(() =>
    this.isMobileScreen() && this.mobilePlaybackPoints().length > 0
  );

  geofenceIcon = computed(() => this.showGeofences() ? 'eye-off-outline' : 'eye-outline');
  trackingIcon = computed(() => this.autoTrackingEnabled() ? 'navigate' : 'navigate-outline');

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
    if (this.routePlayback.routePoints().length > 0) return [];

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
  private readonly routePlayback = inject(RoutePlaybackService);
  private readonly routeOverlay = inject(MapRouteOverlayService);
  private readonly mapUtils = inject(MapUtilsService);
  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private readonly wsService = inject(VehicleWebSocketService);
  private readonly animationService = inject(VehicleAnimationService);
  private readonly mobilePlaybackService = inject(MapPlaybackMobileService);
  private readonly autoTrackingService = inject(MapAutoTrackingService);

  constructor() {
    addIcons({ chevronUpOutline, chevronDownOutline, closeOutline, locationOutline, eyeOutline, eyeOffOutline, navigate, navigateOutline });

    // Effect para auto-tracking del vehículo
    effect(() => {
      const vehicles = this.wsService.vehiclesList();
      const isTrackingEnabled = this.autoTrackingService.autoTrackingEnabled();
      const trackedId = this.autoTrackingService.trackedVehicleId();

      if (isTrackingEnabled && trackedId && vehicles.length > 0) {
        this.autoTrackingService.centerOnTrackedVehicle(this.googleMap?.googleMap);
      }
    });

    // Effect para Route Playback - sincronizar puntos de ruta
    effect(() => {
      const points = this.routePlayback.routePoints();
      const map = this.googleMap?.googleMap;
      if (points.length === 0) {
        this.routeOverlay.clearRouteOverlays();
      } else if (map) {
        this.routeOverlay.renderRoutePolyline(map, points);
      }
    });

    // Effect para Route Playback - sync de posición en seek/pausa
    effect(() => {
      const point = this.routePlayback.currentPoint();
      if (this.routePlayback.isPlaying()) return;
      const map = this.googleMap?.googleMap;
      if (point && map) {
        this.routeOverlay.updateVehicleMarker(map, point.latitude, point.longitude, point.heading ?? 0, point.status);
        map.panTo({ lat: point.latitude, lng: point.longitude });
      }
    });
  }

  async ngOnInit() {
    window.addEventListener('resize', this.resizeListener);

    this.routePlayback.setFrameCallback((lat, lng, heading, status) => {
      const map = this.googleMap?.googleMap;
      if (map) {
        this.routeOverlay.updateVehicleMarker(map, lat, lng, heading, status);
        const result = this.autoTrackingService.throttledPanTo(
          map, lat, lng, this.lastPlaybackPanTimestamp, this.PLAYBACK_PAN_INTERVAL_MS
        );
        if (result.panned) {
          this.lastPlaybackPanTimestamp = result.newTimestamp;
        }
      }
    });

    this.subscription.add(
      this.vehicleSelectionService.vehicleSelected$.subscribe(vehicleId => {
        this.focusOnVehicle(vehicleId);
        this.selectedVehicleId.set(vehicleId);
        this.showVehicleDetail.set(true);
      })
    );

    this.loadVehiclesFromSidebar();
    this.connectToSignalR();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    this.routePlayback.setFrameCallback(null);
    this.subscription.unsubscribe();
    this.wsService.disconnect();
    this.animationService.stopAllAnimations();
    this.routeOverlay.clearRouteOverlays();
    this.autoTrackingService.cleanup();

    if (this.cleanupMapListeners) {
      this.cleanupMapListeners();
    }
  }

  private loadVehiclesFromSidebar(): void {
    this.vehicleService.getSidebarUnits().subscribe({
      next: (sidebarUnits) => {
        const vehicles = sidebarUnits
          .filter(unit => unit.latitude !== null && unit.longitude !== null)
          .map(unit => this.mapUtils.mapSidebarUnitToVehicleDetail(unit));

        this.wsService.initializeVehicles(vehicles);
      },
      error: (error) => {
        console.error('Error al cargar vehículos desde sidebar-units:', error);
      }
    });
  }

  private async connectToSignalR(): Promise<void> {
    try {
      await this.wsService.connect();
      this.mapUtils.startTelemetryListener();
    } catch (error) {
      console.error('Error conectando a SignalR:', error);
    }
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

  // Métodos de playback móvil - delegados al servicio
  mobileTogglePlayback() { this.mobilePlaybackService.togglePlayback(); }
  mobileSetSpeed(speed: number) { this.mobilePlaybackService.setSpeed(speed as any); }
  mobileGoToFirst() { this.mobilePlaybackService.goToFirst(); }
  mobileGoToPrevious() { this.mobilePlaybackService.goToPrevious(); }
  mobileGoToNext() { this.mobilePlaybackService.goToNext(); }
  mobileGoToLast() { this.mobilePlaybackService.goToLast(); }
  mobileOnSliderChange(event: CustomEvent) { this.mobilePlaybackService.onSliderChange(event); }
  toggleSheet() { this.mobilePlaybackService.toggleSheet(); }
  mobileCloseRoute() { this.mobilePlaybackService.closeRoute(); }
  onMobilePointClick(point: any) { this.mobilePlaybackService.onPointClick(point); }

  toggleGeofences() {
    const newState = !this.showGeofences();
    this.showGeofences.set(newState);
  }

  toggleAutoTracking() {
    const activated = this.autoTrackingService.toggleTracking();
    if (activated) {
      this.autoTrackingService.centerOnTrackedVehicle(this.googleMap?.googleMap);
      this.setupMapInteractionListeners();
    }
  }

  private setupMapInteractionListeners() {
    if (this.cleanupMapListeners) {
      this.cleanupMapListeners();
    }

    this.cleanupMapListeners = this.autoTrackingService.setupMapInteractionListeners(
      this.googleMap?.googleMap,
      () => this.autoTrackingService.disableTracking()
    ) || null;
  }
}
