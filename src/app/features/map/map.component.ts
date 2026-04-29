import { Component, OnInit, ViewChild, OnDestroy, computed, signal, inject, effect } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonFab, IonFabButton, IonFabList, IonIcon, IonPopover, IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AlertsListComponent, AlertView } from './components/alerts-list/alerts-list.component';
import { UserMenuComponent } from '../../core/components/user-menu/user-menu.component';
import { VehicleSelectionService } from '../services/vehicle-selection';
import { VehicleVisibilityService } from '../services/vehicle-visibility.service';
import { GeofenceVisibilityService } from '../services/geofence-visibility.service';
import { VehicleDetailComponent } from '../home/components/vehicle-detail/vehicle-detail.component';
import { VehicleDetailMobileComponent } from '../home/components/vehicle-detail-mobile/vehicle-detail-mobile.component';
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
import { chevronUpOutline, chevronDownOutline, closeOutline, locationOutline, locateOutline, eyeOutline, eyeOffOutline, navigate, navigateOutline, layersOutline, mapOutline, globeOutline, earthOutline, notificationsOutline, notifications, enterOutline, exitOutline, notificationsOffOutline, arrowUndoOutline, arrowRedoOutline, trashOutline } from 'ionicons/icons';

import { VehicleDetail } from './interfaces/vehicle-detail.interface';
import { AlertService } from '../alerts/services/alert.service';
import { Alert } from '../alerts/interfaces/alert.interface';
import { AuthService } from '../auth/services/auth.service';
import { GeofenceService } from '../geofences/services/geofence.service';
import { GeofenceResponse } from '../geofences/interfaces/geofence-request.interface';
import { GeofenceDrawingService } from '../geofences/services/geofence-drawing.service';
import {
  TerraDraw,
  TerraDrawCircleMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  TerraDrawRenderMode
} from 'terra-draw';
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter';

interface VehicleMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  icon: google.maps.Icon;
}

// Re-exportar la interfaz del componente para uso interno
interface GeofenceAlertView extends AlertView {}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker, VehicleDetailComponent, VehicleDetailMobileComponent, IonFab, IonFabButton, IonFabList, IonIcon, IonPopover, IonButton, IonContent, IonList, IonItem, IonLabel, AlertsListComponent, UserMenuComponent, GeofenceOverlayComponent, RoutePlaybackPlayerComponent]
})
export class MapComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private cleanupMapListeners: (() => void) | null = null;
  private lastPlaybackPanTimestamp = 0;
  private readonly PLAYBACK_PAN_INTERVAL_MS = 2000;

  selectedVehicleId = signal<string | null>(null);
  showVehicleDetail = signal<boolean>(false);
  currentMapType = signal<string>('roadmap');

  // Geofence visibility - computed from service
  showGeofences = computed(() => {
    const visibilityEnabled = this.geofenceVisibilityService.geofenceVisibilityEnabled();
    const selectedCount = this.geofenceVisibilityService.selectedGeofenceIds().size;
    const totalCount = this.geofenceService.geofences().length;
    const result = visibilityEnabled && selectedCount > 0;
    console.log('[MapComponent] showGeofences computed:', { visibilityEnabled, selectedCount, totalCount, result });
    return result;
  });

  // Drawing mode - for hiding vehicles/geofences
  isDrawingGeofence = computed(() => this.geofenceDrawingService.isDrawing());

  isMobileScreen = signal<boolean>(window.innerWidth <= 768);
  private resizeListener = () => this.isMobileScreen.set(window.innerWidth <= 768);

  // Delegar señales de playback móvil al servicio
  sheetExpanded = computed(() => this.mobilePlaybackService.sheetExpanded());
  playbackSpeed = computed(() => this.mobilePlaybackService.playbackSpeed());
  mobilePlaybackPoints = computed(() => this.mobilePlaybackService.mobilePlaybackPoints());
  mobileCurrentPointIndex = computed(() => this.mobilePlaybackService.mobileCurrentPointIndex());
  isPlaybackPlaying = computed(() => this.mobilePlaybackService.isPlaybackPlaying());
  isLoadingRoute = computed(() => {
    const loading = this.routePlayback.isLoadingRoute();
    console.log('[MapComponent] isLoadingRoute:', loading);
    return loading;
  });

  // Delegar señales de auto-tracking al servicio
  autoTrackingEnabled = computed(() => this.autoTrackingService.isTrackingEnabled);
  trackedVehicleId = computed(() => this.autoTrackingService.currentTrackedVehicleId);

  showMobilePlayer = computed(() => {
    const isMobile = this.isMobileScreen();
    const hasPoints = this.mobilePlaybackPoints().length > 0;
    const isLoading = this.isLoadingRoute();
    const result = isMobile && (hasPoints || isLoading);
    console.log('[MapComponent] showMobilePlayer:', { isMobile, hasPoints, isLoading, result });
    return result;
  });

  geofenceIcon = computed(() => this.showGeofences() ? 'eye-off-outline' : 'eye-outline');
  trackingIcon = computed(() => this.autoTrackingEnabled() ? 'navigate' : 'navigate-outline');

  // Alerts signals
  private readonly _alerts = signal<GeofenceAlertView[]>([]);
  readonly isLoadingAlerts = signal<boolean>(false);
  readonly alertsError = signal<string | null>(null);

  // Todas las alertas (para mostrar en el menú) - ahora son input del componente
  readonly allAlerts = computed(() =>
    this._alerts()
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
  );

  // Conteo de todas las alertas
  readonly allAlertsCount = computed(() => this._alerts().length);

  // Solo no leídas (para el badge y color del botón)
  readonly unreadAlertsCount = computed(() =>
    this._alerts().filter(alert => !alert.read).length
  );

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
    const visibleVehicleIds = this.vehicleVisibilityService.selectedVehicleIds();

    return this.wsService.vehiclesList()
      .filter(vehicle => visibleVehicleIds.has(vehicle.id))  // Filtrar solo vehículos visibles
      .map(vehicle => {
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
  private readonly vehicleVisibilityService = inject(VehicleVisibilityService);
  private readonly wsService = inject(VehicleWebSocketService);
  private readonly animationService = inject(VehicleAnimationService);
  private readonly mobilePlaybackService = inject(MapPlaybackMobileService);
  private readonly autoTrackingService = inject(MapAutoTrackingService);
  private readonly alertService = inject(AlertService);
  private readonly geofenceService = inject(GeofenceService);
  private readonly geofenceVisibilityService = inject(GeofenceVisibilityService);
  private readonly geofenceDrawingService = inject(GeofenceDrawingService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Terra Draw
  private terraDraw: TerraDraw | null = null;
  private drawingInitialized = false;

  constructor() {
    addIcons({ chevronUpOutline, chevronDownOutline, closeOutline, locationOutline, locateOutline, eyeOutline, eyeOffOutline, navigate, navigateOutline, layersOutline, mapOutline, globeOutline, earthOutline, notificationsOutline, notifications, enterOutline, exitOutline, notificationsOffOutline, arrowUndoOutline, arrowRedoOutline, trashOutline });

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

    // Effect para centrar en geocerca seleccionada desde sidebar
    effect(() => {
      const geofenceToCenter = this.geofenceService.selectedGeofenceToCenter();
      if (geofenceToCenter) {
        this.centerOnGeofence(geofenceToCenter);
        // Limpiar la selección después de centrar
        this.geofenceService.clearSelectedGeofenceToCenter();
      }
    });

    // Effect para inicializar/detener Terra Draw cuando cambia el modo de dibujo
    effect(() => {
      const isDrawing = this.geofenceDrawingService.isDrawing();
      const drawMode = this.geofenceDrawingService.drawMode();
      const map = this.googleMap?.googleMap;

      if (map) {
        if (isDrawing && drawMode) {
          // Inicializar Terra Draw si no está inicializado
          if (!this.drawingInitialized) {
            this.initializeTerraDraw();
          }
          // Cambiar al modo de dibujo
          this.setTerraDrawMode(drawMode);
        } else {
          // Detener dibujo
          this.stopTerraDraw();
        }
      }
    });

    // Effect para cambiar el modo de dibujo cuando cambia en el servicio
    effect(() => {
      const drawMode = this.geofenceDrawingService.drawMode();
      if (this.drawingInitialized && drawMode && this.terraDraw) {
        this.setTerraDrawMode(drawMode);
      }
    });

    // Effect para ocultar/mostrar geocercas cuando se está dibujando
    effect(() => {
      const shouldHide = this.geofenceDrawingService.shouldHideGeofences();
      console.log('[MapComponent] Drawing effect - shouldHide geofences:', shouldHide);
      if (shouldHide) {
        // Ocultar todas las geocercas mientras se dibuja
        console.log('[MapComponent] Drawing effect - hiding all geofences');
        this.geofenceVisibilityService.hideAll();
      }
      // REMOVED: El auto-show cuando no se está dibujando para no interferir con el toggle manual
    });

    // Effect para ocultar vehículos cuando se está dibujando
    effect(() => {
      const shouldHide = this.geofenceDrawingService.shouldHideVehicles();
      if (shouldHide) {
        // Ocultar todos los vehículos mientras se dibuja
        this.vehicleVisibilityService.hideAll();
      }
      // NOTA: No restauramos automáticamente los vehículos al dejar de dibujar
      // porque eso sobreescribiría la selección manual del usuario.
      // Los vehículos permanecerán ocultos/visibles según el estado actual.
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
    this.loadGeofenceAlerts();

    // Leer vehicleId de query params y centrar en ese vehículo
    this.handleQueryParams();
  }

  private handleQueryParams(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const vehicleId = params['vehicleId'];
      if (vehicleId) {
        // Esperar a que los vehículos estén cargados antes de enfocar
        const checkAndFocus = () => {
          const vehicles = this.wsService.vehiclesList();
          if (vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
              this.focusOnVehicle(vehicleId);
              this.selectedVehicleId.set(vehicleId);
              this.showVehicleDetail.set(true);
              // Limpiar el query param para no re-centrar al refrescar
              this.clearVehicleIdQueryParam();
            }
          } else {
            // Si los vehículos aún no cargaron, reintentar en 500ms
            setTimeout(checkAndFocus, 500);
          }
        };
        checkAndFocus();
      }
    });
  }

  private clearVehicleIdQueryParam(): void {
    // Limpiar el query param sin recargar la página
    const url = new URL(window.location.href);
    url.searchParams.delete('vehicleId');
    window.history.replaceState({}, '', url.toString());
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

        // Inicializar todos los vehículos como visibles en el mapa
        const vehicleIds = vehicles.map(v => v.id);
        this.vehicleVisibilityService.showAll(vehicleIds);
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

  onEditVehicle() {
    // TODO: Implementar navegación a edición de vehículo
    console.log('[MapComponent] Editar vehículo:', this.selectedVehicleId());
  }

  onLocateVehicle() {
    // Centrar el mapa en el vehículo seleccionado
    const vehicleId = this.selectedVehicleId();
    if (vehicleId) {
      const marker = this.markers().find((m: VehicleMarker) => m.id === vehicleId);
      if (marker && this.googleMap?.googleMap) {
        this.googleMap.googleMap.panTo(marker.position);
        this.googleMap.googleMap.setZoom(18);
      }
    }
  }

  onExpandVehicle() {
    // TODO: Implementar vista expandida del vehículo
    console.log('[MapComponent] Ampliar vehículo:', this.selectedVehicleId());
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
    console.log('[MapComponent] toggleGeofences() CLICKED!!!');

    const visibilityEnabled = this.geofenceVisibilityService.geofenceVisibilityEnabled();
    const geofences = this.geofenceService.geofences();
    const selectedIds = this.geofenceVisibilityService.selectedGeofenceIds();

    console.log('[MapComponent] toggleGeofences() called');
    console.log('[MapComponent] Total geofences:', geofences.length);
    console.log('[MapComponent] Selected geofences count:', selectedIds.size);
    console.log('[MapComponent] Visibility enabled:', visibilityEnabled);

    // Usar el interruptor general sin cambiar las selecciones
    this.geofenceVisibilityService.toggleGeofenceVisibility();
  }

  changeMapType(mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') {
    if (this.googleMap?.googleMap) {
      this.googleMap.googleMap.setMapTypeId(mapType);
      this.currentMapType.set(mapType);
    }
  }

  getMapTypeLabel(): string {
    const mapType = this.currentMapType();
    switch (mapType) {
      case 'roadmap':
        return 'Mapa';
      case 'satellite':
        return 'Satélite';
      case 'hybrid':
        return 'Híbrido';
      case 'terrain':
        return 'Terreno';
      default:
        return 'Mapa';
    }
  }

  centerOnGeofence(geofence: { geoJson: string; geometryType: string; name: string }): void {
    if (!this.googleMap?.googleMap) return;

    const map = this.googleMap.googleMap;

    try {
      const geoJson = JSON.parse(geofence.geoJson);
      let center: google.maps.LatLngLiteral;

      if (geofence.geometryType === 'circle' && geoJson.type === 'Point') {
        // Para círculos, el centro está en coordinates
        center = { lat: geoJson.coordinates[1], lng: geoJson.coordinates[0] };
        map.setCenter(center);
        map.setZoom(16);
      } else if (geoJson.type === 'Polygon') {
        // Para polígonos, calcular el centroide
        const coordinates = geoJson.coordinates[0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));
        center = this.calculateCentroid(coordinates);
        map.setCenter(center);
        map.setZoom(15);
      } else if (geoJson.type === 'MultiPolygon') {
        // Para multipolígonos, usar el primer polígono
        const coordinates = geoJson.coordinates[0][0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));
        center = this.calculateCentroid(coordinates);
        map.setCenter(center);
        map.setZoom(15);
      }
    } catch (error) {
      console.error('Error al centrar en geocerca:', error);
    }
  }

  private calculateCentroid(coordinates: { lat: number; lng: number }[]): google.maps.LatLngLiteral {
    let latSum = 0;
    let lngSum = 0;
    coordinates.forEach(coord => {
      latSum += coord.lat;
      lngSum += coord.lng;
    });
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  }

  toggleAutoTracking() {
    const activated = this.autoTrackingService.toggleTracking();
    if (activated) {
      this.autoTrackingService.centerOnTrackedVehicle(this.googleMap?.googleMap);
      this.setupMapInteractionListeners();
    }
  }

  // Alerts methods - triggered when popover opens
  onPopoverWillPresent(): void {
    this.loadGeofenceAlerts();
  }

  onAlertClick(alertId: string): void {
    const alert = this._alerts().find(a => a.id === alertId);
    if (!alert || alert.read) return;

    // Optimistic update
    this._alerts.update(alerts =>
      alerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      )
    );

    // Call API
    this.alertService.markAsRead(alert.alertId).subscribe({
      error: (err) => {
        console.error('Error al marcar alerta como leída:', err);
        // Revert on error
        this._alerts.update(alerts =>
          alerts.map(a =>
            a.id === alertId ? { ...a, read: false } : a
          )
        );
      }
    });
  }

  private loadGeofenceAlerts(): void {
    this.isLoadingAlerts.set(true);
    this.alertsError.set(null);

    // Get ALL alerts (not just unread)
    this.alertService.getAlerts('all', 1, 100).subscribe({
      next: (response) => {
        // Filter only geofence alerts and map to view model
        const geofenceAlerts = response.items
          .filter(alert => alert.alertType === 'geofence_enter' || alert.alertType === 'geofence_exit')
          .map((alert, index) => this.mapAlertToViewModel(alert, index));

        this._alerts.set(geofenceAlerts);
        this.isLoadingAlerts.set(false);
      },
      error: (err) => {
        console.error('Error al cargar alertas:', err);
        this.alertsError.set('Error al cargar las alertas');
        this.isLoadingAlerts.set(false);
      }
    });
  }

  private mapAlertToViewModel(alert: Alert, index: number): GeofenceAlertView {
    return {
      id: index.toString(), // Use index as local id for tracking
      alertId: alert.alertId,
      vehicleName: alert.vehicleLabel || 'Vehículo desconocido',
      message: alert.message,
      alertType: alert.alertType,
      severity: alert.severity,
      createdAtUtc: alert.createdAtUtc,
      read: alert.isRead
    };
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

  // ==================== TERRA DRAW METHODS ====================
  private initializeTerraDraw(): void {
    if (!this.googleMap?.googleMap || this.drawingInitialized) return;

    const map = this.googleMap.googleMap;

    const adapter = new TerraDrawGoogleMapsAdapter({
      map: map,
      lib: google.maps
    });

    this.terraDraw = new TerraDraw({
      adapter: adapter,
      modes: [
        new TerraDrawSelectMode({
          flags: {
            arbitary: {
              feature: {}
            }
          }
        }),
        new TerraDrawCircleMode({
          validation: () => ({ valid: true })
        }),
        new TerraDrawPolygonMode({
          pointerDistance: 40,
          keyEvents: {
            cancel: 'Escape',
            finish: 'Enter'
          }
        }),
        new TerraDrawRectangleMode({
          validation: () => ({ valid: true })
        }),
        new TerraDrawRenderMode({
          modeName: 'render',
          styles: {
            polygonFillColor: '#3b82f6',
            polygonOutlineColor: '#1e40af',
            polygonOutlineWidth: 2,
            polygonFillOpacity: 0.3,
            pointColor: '#3b82f6',
            pointOutlineColor: '#ffffff',
            pointOutlineWidth: 2,
            pointWidth: 6
          }
        })
      ]
    });

    this.terraDraw.start();
    this.drawingInitialized = true;

    // Escuchar evento de finalización del dibujo
    this.terraDraw.on('finish', (id) => {
      this.onTerraDrawFinish(id);
    });
  }

  private setTerraDrawMode(mode: 'circle' | 'polygon' | 'rectangle' | 'select'): void {
    if (!this.terraDraw) return;

    // Limpiar dibujos anteriores antes de cambiar de modo
    this.terraDraw.clear();

    const terraMode = mode === 'select' ? 'select' : mode;
    this.terraDraw.setMode(terraMode);
  }

  private stopTerraDraw(): void {
    if (!this.terraDraw) return;

    this.terraDraw.stop();
    this.terraDraw = null;
    this.drawingInitialized = false;
  }

  private onTerraDrawFinish(id: string | number): void {
    if (!this.terraDraw) return;

    const snapshot = this.terraDraw.getSnapshot();
    const feature = snapshot.find(f => f.id === id);

    if (feature) {
      // Si hay más de una feature, mantener solo la última
      if (snapshot.length > 1) {
        const featuresToDelete = snapshot
          .filter(f => f.id !== id)
          .map(f => f.id);
        this.terraDraw.removeFeatures(featuresToDelete);
      }

      // Guardar la geometría en el servicio
      this.geofenceDrawingService.setDrawnGeometry(feature);
    }
  }

  /**
   * Cerrar sesión del usuario
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
