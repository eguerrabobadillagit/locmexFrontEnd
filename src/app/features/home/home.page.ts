import { Component, signal, inject, OnInit, OnDestroy, effect, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonSplitPane,
  IonButton,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  carOutline, speedometerOutline, batteryHalfOutline, powerOutline,
  eyeOutline, listOutline, gridOutline, closeOutline, analyticsOutline, alertCircleOutline,
  shieldOutline, menuOutline
} from 'ionicons/icons';
import { UserMenuComponent } from '../../core/components/user-menu/user-menu.component';
import { AuthService } from '../auth/services/auth.service';
import { RoutePlaybackService } from '../map/service/route-playback.service';
import { Subscription, filter } from 'rxjs';

// Sidebar imports
import { NavbarComponent } from './components/navbar/navbar.component';
import { GeofenceListComponent } from './components/geofence-list/geofence-list.component';
import { FleetTrackingViewComponent } from './components/fleet-tracking-view/fleet-tracking-view.component';
import { VehicleSelectionService } from '../services/vehicle-selection';
import { VehicleService, SidebarUnit } from '../vehicles/services/vehicle.service';
import { VehicleWebSocketService } from '../map/service/vehicle-websocket.service';
import { VehicleDetail } from '../map/interfaces/vehicle-detail.interface';
import { Vehicle, getVehicleStatusClass } from '../vehicles/interfaces/vehicle.interface';
import { GeofenceService } from '../geofences/services/geofence.service';
import { GeofenceResponse, CreateGeofenceRequest } from '../geofences/interfaces/geofence-request.interface';
import { GeofenceVisibilityService } from '../services/geofence-visibility.service';
import { GeofenceSidebarFormComponent, GeofenceSidebarFormData, ShapeType } from '../geofences/components/geofence-sidebar-form/geofence-sidebar-form.component';
import { GeofenceDrawingService, DrawMode } from '../geofences/services/geofence-drawing.service';

export type SidebarTab = 'unidades' | 'geocercas' | 'menu';
export type GeofenceViewMode = 'list' | 'create' | 'edit';
type GeofenceFilterTab = 'todas' | 'activas' | 'inactivas';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonSplitPane,
    IonButton,
    IonIcon,
    RouterOutlet,
    UserMenuComponent,
    NavbarComponent,
    GeofenceListComponent,
    FleetTrackingViewComponent,
    GeofenceSidebarFormComponent
  ],
})
export class HomePage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly routePlayback = inject(RoutePlaybackService);
  private routerSubscription?: Subscription;

  // Sidebar services
  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private readonly vehicleService = inject(VehicleService);
  private readonly wsService = inject(VehicleWebSocketService);
  private readonly geofenceService = inject(GeofenceService);
  private readonly geofenceVisibilityService = inject(GeofenceVisibilityService);
  private readonly geofenceDrawingService = inject(GeofenceDrawingService);
  private readonly alertController = inject(AlertController);
  // Sidebar signals
  selectedMenu = signal<string>('dashboard');
  showFleetPanel = signal<boolean>(true);
  activeSidebarTab = signal<SidebarTab>('menu');
  viewMode = signal<'card' | 'list'>('list');

  // Geocercas signals
  geofenceSearchQuery = signal<string>('');
  geofenceFilterTab = signal<GeofenceFilterTab>('todas');
  geofenceViewMode = signal<GeofenceViewMode>('list');
  editingGeofence = signal<GeofenceResponse | null>(null);
  geofenceDrawShapeType = signal<ShapeType>('circular');



  // Vehicles signals
  sidebarUnits = signal<Vehicle[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed vehicles
  vehicles = computed(() => {
    const sidebar = this.sidebarUnits();
    const socketVehicles = this.wsService.vehiclesList();

    if (socketVehicles.length === 0) {
      return sidebar;
    }

    return sidebar.map(sidebarVehicle => {
      const socketVehicle = socketVehicles.find(v => v.id === sidebarVehicle.id);
      return socketVehicle
        ? this.mapSocketVehicleToSidebarFormat(socketVehicle, sidebarVehicle)
        : sidebarVehicle;
    });
  });

  private get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  constructor() {
    addIcons({
      carOutline,
      closeOutline,
      alertCircleOutline,
      analyticsOutline,
      eyeOutline,
      speedometerOutline,
      batteryHalfOutline,
      powerOutline,
      listOutline,
      gridOutline,
      shieldOutline,
      menuOutline,
    });

    effect(() => {
      if (this.routePlayback.requestSidebarOpen()) {
        this.routePlayback.consumeSidebarRequest();
        this.showFleetPanel.set(true);
      }
    });

  }

  ngOnInit() {
    this.updateSelectedMenuFromUrl(this.router.url);
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSelectedMenuFromUrl(event.urlAfterRedirects);
      });

    // Load sidebar data
    this.loadVehicles();
    this.loadGeofences();

    if (this.wsService.connectionStatus() !== 'connected') {
      this.wsService.connect();
    }
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  // ==================== MENU METHODS ====================
  private updateSelectedMenuFromUrl(url: string): void {
    const segments = url.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment && lastSegment !== 'home') {
      this.selectedMenu.set(lastSegment);
    }
  }

  onMenuSelect(menuId: string) {
    this.selectedMenu.set(menuId);
    this.router.navigate(['/home', menuId]);
    if (this.isMobile) {
      this.closeFleetPanel();
    }
  }

  // ==================== SIDEBAR PANEL METHODS ====================
  closeFleetPanel() {
    this.showFleetPanel.set(false);
  }

  onMobileSidebarClose() {
    this.showFleetPanel.set(false);
  }

  onMobileSidebarOpen() {
    this.showFleetPanel.set(true);
  }

  toggleFleetPanel() {
    this.showFleetPanel.set(!this.showFleetPanel());
  }

  onSidebarTabChange(tab: SidebarTab) {
    this.activeSidebarTab.set(tab);
  }

  onTabClick(tab: SidebarTab): void {
    this.activeSidebarTab.set(tab);
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'list' ? 'card' : 'list');
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  // ==================== VEHICLES METHODS ====================
  loadVehicles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.vehicleService.getSidebarUnits().subscribe({
      next: (response: SidebarUnit[]) => {
        const mappedVehicles = response.map(v => this.mapSidebarUnit(v));
        this.sidebarUnits.set(mappedVehicles);
        const vehicleDetails = response.map(unit => this.mapSidebarUnitToVehicleDetail(unit));
        this.wsService.initializeVehicles(vehicleDetails);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar vehículos:', err);
        this.error.set('Error al cargar los vehículos. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  onVehicleClick(vehicleId: string) {
    this.vehicleSelectionService.selectVehicle(vehicleId);

    if (!this.router.url.includes('map-view')) {
      this.router.navigate(['/home/map-view'], { queryParams: { vehicleId } });
    }

    if (this.isMobile) {
      this.closeFleetPanel();
    }
  }

  onOpenHistory(vehicle: Vehicle) {
    // Implementar según necesidad
    console.log('Open history for:', vehicle);
  }

  // ==================== GEOFENCES METHODS ====================
  loadGeofences(): void {
    console.log('[HomePage] loadGeofences() called');
    this.geofenceService.getGeofences().subscribe({
      next: () => {
        // Inicializar todas las geocercas como visibles por defecto
        const geofences = this.geofenceService.geofences();
        const visibleCount = this.geofenceVisibilityService.selectedGeofenceIds().size;
        console.log('[HomePage] Geofences loaded:', {
          totalGeofences: geofences.length,
          visibleCount,
          geofenceIds: geofences.map(g => g.id)
        });

        // Solo inicializar si no hay geocercas visibles aún (primera carga)
        if (visibleCount === 0 && geofences.length > 0) {
          const allIds = geofences.map(g => g.id);
          console.log('[HomePage] Initializing all geofences as visible:', allIds);
          this.geofenceVisibilityService.showAll(allIds);
        } else {
          console.log('[HomePage] Skipping initialization - geofences already visible or no geofences');
        }
      },
      error: (err) => {
        console.error('Error al cargar geocercas:', err);
      }
    });
  }

  onGeofenceSearchChange(query: string) {
    this.geofenceSearchQuery.set(query);
  }

  onGeofenceFilterChange(filter: GeofenceFilterTab) {
    this.geofenceFilterTab.set(filter);
  }

  onCreateGeofence() {
    // Abrir formulario en el sidebar en lugar de navegar
    this.editingGeofence.set(null);
    this.geofenceViewMode.set('create');
    this.geofenceDrawShapeType.set('circular');

    // Activar modo de dibujo y ocultar geocercas existentes
    this.geofenceDrawingService.startDrawing('circle');

    // Ocultar todas las geocercas en el mapa
    this.geofenceVisibilityService.hideAll();

    // Navegar a map-view si no estamos ahí para mostrar el mapa
    if (!this.router.url.includes('map-view')) {
      this.router.navigate(['/home/map-view']);
    }
  }

  onViewGeofence(geofence: GeofenceResponse) {
    if (this.router.url.includes('map-view')) {
      this.geofenceService.selectGeofenceToCenter(geofence);
    } else {
      this.router.navigate(['/home/map-view']).then(() => {
        setTimeout(() => {
          this.geofenceService.selectGeofenceToCenter(geofence);
        }, 500);
      });
    }
  }

  onEditGeofence(geofence: GeofenceResponse) {
    // Abrir formulario en el sidebar en lugar de navegar
    this.editingGeofence.set(geofence);
    this.geofenceViewMode.set('edit');

    // Mapear geometryType a shapeType
    const geometryTypeMap: Record<string, ShapeType> = {
      'circle': 'circular',
      'circular': 'circular',
      'polygon': 'polygon',
      'rectangle': 'rectangle',
      'rect': 'rectangle'
    };
    this.geofenceDrawShapeType.set(geometryTypeMap[geofence.geometryType] || 'circular');

    // En modo edición NO dibujamos, solo mostramos la geocerca existente
    this.geofenceDrawingService.stopDrawing();

    // Mostrar solo esta geocerca en el mapa
    this.geofenceVisibilityService.hideAll();
    this.geofenceVisibilityService.showGeofence(geofence.id);

    // Centrar la geocerca en el mapa
    this.geofenceService.selectGeofenceToCenter(geofence);

    // Navegar a map-view si no estamos ahí
    if (!this.router.url.includes('map-view')) {
      this.router.navigate(['/home/map-view']);
    }
  }

  async onDeleteGeofence(geofence: GeofenceResponse) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la geocerca "${geofence.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteGeofence(geofence);
          }
        }
      ]
    });

    await alert.present();
  }

  private deleteGeofence(geofence: GeofenceResponse) {
    this.geofenceService.deleteGeofence(geofence.id).subscribe({
      next: () => {
        console.log('Geocerca eliminada exitosamente');
        this.loadGeofences();
      },
      error: (err) => {
        console.error('Error al eliminar geocerca:', err);
        this.showErrorAlert('Error al eliminar', 'No se pudo eliminar la geocerca. Intenta de nuevo.');
      }
    });
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // ==================== GEOFENCE FORM METHODS ====================
  onGeofenceFormSave(formData: GeofenceSidebarFormData): void {
    const geometry = this.geofenceDrawingService.drawnGeometry();
    const isEditMode = this.geofenceViewMode() === 'edit';
    const editingGeofence = this.editingGeofence();

    if (!isEditMode && !geometry) {
      this.showErrorAlert('Error', 'Por favor dibuja una geocerca en el mapa antes de guardar');
      return;
    }

    // Mapear shapeType a geometryType
    const geometryTypeMap: Record<string, string> = {
      'circular': 'circle',
      'polygon': 'polygon',
      'rectangle': 'rectangle'
    };

    if (isEditMode && editingGeofence) {
      // Modo edición: solo actualizar datos, no la geometría
      const updateData = {
        id: editingGeofence.id,
        name: formData.name,
        alertOnEnter: formData.alertOnEnter,
        alertOnExit: formData.alertOnExit,
        isActive: formData.isActive,
        vehicleId: formData.vehicleIds.length > 0 ? formData.vehicleIds[0] : undefined
      };

      this.geofenceService.updateGeofence(editingGeofence.id, updateData).subscribe({
        next: () => {
          this.loadGeofences();
          this.resetGeofenceFormState();
        },
        error: (err) => {
          console.error('Error al actualizar geocerca:', err);
          this.showErrorAlert('Error', 'No se pudo actualizar la geocerca');
        }
      });
    } else {
      // Modo creación: crear con geometría dibujada
      // Preparar el GeoJSON
      const modifiedFeature = {
        ...geometry,
        geometry: {
          ...geometry.geometry,
          type: 'Polygon'
        },
        properties: {
          ...geometry.properties,
          mode: formData.shapeType === 'circular' ? 'circle' : formData.shapeType
        }
      };

      const geoJsonString = JSON.stringify(modifiedFeature);

      const createData: CreateGeofenceRequest = {
        clientId: '20000000-0000-0000-0000-000000000001', // TODO: Obtener del usuario actual
        name: formData.name,
        description: `Geocerca ${formData.shapeType}`,
        geoJson: geoJsonString,
        geometryType: geometryTypeMap[formData.shapeType] || 'polygon',
        alertOnEnter: formData.alertOnEnter,
        alertOnExit: formData.alertOnExit,
        vehicleId: formData.vehicleIds.length > 0 ? formData.vehicleIds[0] : undefined
      };

      this.geofenceService.createGeofence(createData).subscribe({
        next: () => {
          this.loadGeofences();
          this.resetGeofenceFormState();
        },
        error: (err) => {
          console.error('Error al crear geocerca:', err);
          this.showErrorAlert('Error', 'No se pudo crear la geocerca');
        }
      });
    }
  }

  private resetGeofenceFormState(): void {
    // Resetear estado del formulario
    this.geofenceViewMode.set('list');
    this.editingGeofence.set(null);

    // Detener dibujo
    this.geofenceDrawingService.stopDrawing();

    // Mostrar todas las geocercas nuevamente
    const geofences = this.geofenceService.geofences();
    const allIds = geofences.map(g => g.id);
    this.geofenceVisibilityService.showAll(allIds);
  }

  onGeofenceFormCancel(): void {
    this.resetGeofenceFormState();
  }

  onGeofenceFormClose(): void {
    this.resetGeofenceFormState();
  }

  onGeofenceShapeTypeChange(shapeType: ShapeType): void {
    this.geofenceDrawShapeType.set(shapeType);

    // Mapear a modo de TerraDraw
    const modeMap: Record<string, DrawMode> = {
      'circular': 'circle',
      'polygon': 'polygon',
      'rectangle': 'rectangle'
    };

    this.geofenceDrawingService.changeDrawMode(modeMap[shapeType]);
    console.log('Cambiar tipo de forma:', shapeType);
  }

  // ==================== MAPPING METHODS ====================
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
      heading: 0,
      motorHours: 0,
      latitude: unit.latitude ?? 0,
      longitude: unit.longitude ?? 0,
      satellites: 0,
      altitude: 0,
      odometer: 0,
      lastReport: unit.lastMessageAtUtc
    };
  }

  private mapSidebarUnit(unit: SidebarUnit): Vehicle {
    const status = this.getStatusFromCode(unit.statusCode, unit.ignitionOn);
    return {
      id: unit.vehicleId || unit.deviceId,
      plate: unit.plate,
      driver: unit.driverName || 'Sin asignar',
      model: unit.unitLabel,
      status: status,
      statusText: this.getStatusText(status),
      lastUpdate: this.getRelativeTime(unit.lastMessageAtUtc),
      speed: unit.speedKph || 0,
      battery: unit.batteryLevel || 0,
      motorOn: unit.ignitionOn,
      latitude: unit.latitude ?? undefined,
      longitude: unit.longitude ?? undefined,
    };
  }

  private mapSocketVehicleToSidebarFormat(socketVehicle: VehicleDetail, sidebarVehicle: Vehicle): Vehicle {
    const status = this.getStatusFromSocketData(socketVehicle.status, socketVehicle.speed);
    return {
      id: socketVehicle.id,
      plate: socketVehicle.plate,
      driver: sidebarVehicle.driver,
      model: sidebarVehicle.model,
      status: status,
      statusText: this.getStatusText(status),
      lastUpdate: this.getRelativeTime(socketVehicle.lastReport),
      speed: socketVehicle.speed,
      battery: socketVehicle.fuel,
      motorOn: socketVehicle.speed > 0 || socketVehicle.status === 'moving',
      latitude: socketVehicle.latitude,
      longitude: socketVehicle.longitude,
    };
  }

  private getStatusFromSocketData(statusCode: string, speed: number): 'moving' | 'stopped' | 'no-signal' {
    if (statusCode === 'offline' || statusCode === 'no-signal') return 'no-signal';
    if (speed > 0 || statusCode === 'moving' || statusCode === 'In_route') return 'moving';
    return 'stopped';
  }

  private getStatusFromCode(statusCode: string, ignitionOn: boolean): 'moving' | 'stopped' | 'no-signal' {
    if (statusCode === 'offline') return 'no-signal';
    if (ignitionOn) return 'moving';
    return 'stopped';
  }

  private getStatusText(status: 'moving' | 'stopped' | 'no-signal'): string {
    switch (status) {
      case 'moving': return 'En movimiento';
      case 'stopped': return 'Detenido';
      case 'no-signal': return 'Sin señal';
      default: return 'Desconocido';
    }
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  getStatusClass(status: string): string {
    return getVehicleStatusClass(status);
  }
}
