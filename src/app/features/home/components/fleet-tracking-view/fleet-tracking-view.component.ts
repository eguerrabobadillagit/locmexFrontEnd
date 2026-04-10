import { Component, OnInit, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonSpinner, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, speedometerOutline, batteryHalfOutline, powerOutline, eyeOutline, listOutline, gridOutline, closeOutline } from 'ionicons/icons';
import { VehicleSelectionService } from '../../../services/vehicle-selection';
import { VehicleService, SidebarUnit } from '../../../vehicles/services/vehicle.service';
import { VehicleWebSocketService } from '../../../map/service/vehicle-websocket.service';
import { VehicleDetail } from '../../../map/interfaces/vehicle-detail.interface';

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  model: string;
  status: 'moving' | 'stopped' | 'no-signal';
  statusText: string;
  lastUpdate: string;
  speed: number;
  battery: number;
  motorOn: boolean;
}

@Component({
  selector: 'app-fleet-tracking-view',
  templateUrl: './fleet-tracking-view.component.html',
  styleUrls: ['./fleet-tracking-view.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonCard, IonCardContent, IonSpinner]
})
export class FleetTrackingViewComponent implements OnInit {
  closeView = output<void>();
  viewMode: 'list' | 'grid' = 'list';
  
  // Signal para datos iniciales de sidebar-units
  sidebarUnits = signal<Vehicle[]>([]);
  
  // Computed que combina datos iniciales con actualizaciones del socket
  vehicles = computed(() => {
    const sidebar = this.sidebarUnits();
    const socketVehicles = this.wsService.vehiclesList();
    
    // Si no hay datos del socket, retornar sidebar
    if (socketVehicles.length === 0) {
      return sidebar;
    }
    
    // Combinar: usar datos del socket si existen, sino usar sidebar
    return sidebar.map(sidebarVehicle => {
      const socketVehicle = socketVehicles.find(v => v.id === sidebarVehicle.id);
      return socketVehicle 
        ? this.mapSocketVehicleToSidebarFormat(socketVehicle, sidebarVehicle)
        : sidebarVehicle;
    });
  });
  
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private readonly menuController = inject(MenuController);
  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private readonly vehicleService = inject(VehicleService);
  private readonly wsService = inject(VehicleWebSocketService);

  constructor() {
    addIcons({
      'car-outline': carOutline,
      'speedometer-outline': speedometerOutline,
      'battery-half-outline': batteryHalfOutline,
      'power-outline': powerOutline,
      'eye-outline': eyeOutline,
      'list-outline': listOutline,
      'grid-outline': gridOutline,
      'close-outline': closeOutline
    });
  }

  ngOnInit() {
    this.loadVehicles();
    
    // Conectar al WebSocket si no está conectado
    if (this.wsService.connectionStatus() !== 'connected') {
      this.wsService.connect();
    }
  }

  loadVehicles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.vehicleService.getSidebarUnits().subscribe({
      next: (response: SidebarUnit[]) => {
        const mappedVehicles = response.map(v => this.mapSidebarUnit(v));
        this.sidebarUnits.set(mappedVehicles);
        
        // Inicializar vehículos en el WebSocket service si no están
        const socketVehicles = this.wsService.vehiclesList();
        if (socketVehicles.length === 0) {
          const vehicleDetails = response
            .filter(unit => unit.latitude !== null && unit.longitude !== null)
            .map(unit => this.mapSidebarUnitToVehicleDetail(unit));
          this.wsService.initializeVehicles(vehicleDetails);
        }
        
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar vehículos:', err);
        this.error.set('Error al cargar los vehículos. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
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
      motorOn: unit.ignitionOn
    };
  }

  private mapSocketVehicleToSidebarFormat(socketVehicle: VehicleDetail, sidebarVehicle: Vehicle): Vehicle {
    // Determinar status basado en velocidad y estado del socket
    const status = this.getStatusFromSocketData(socketVehicle.status, socketVehicle.speed);
    
    return {
      id: socketVehicle.id,
      plate: socketVehicle.plate,
      driver: sidebarVehicle.driver, // Mantener driver del sidebar (no viene en socket)
      model: sidebarVehicle.model, // Mantener modelo del sidebar
      status: status,
      statusText: this.getStatusText(status),
      lastUpdate: this.getRelativeTime(socketVehicle.lastReport),
      speed: socketVehicle.speed,
      battery: socketVehicle.fuel, // fuel del socket = battery del sidebar
      motorOn: socketVehicle.speed > 0 || socketVehicle.status === 'moving' // Inferir motor ON
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
    switch(status) {
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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  onClose() {
    this.closeView.emit();
  }

  onVehicleClick(vehicleId: string) {
    this.vehicleSelectionService.selectVehicle(vehicleId);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'moving': return 'status-moving';
      case 'stopped': return 'status-stopped';
      case 'no-signal': return 'status-no-signal';
      default: return '';
    }
  }
}
