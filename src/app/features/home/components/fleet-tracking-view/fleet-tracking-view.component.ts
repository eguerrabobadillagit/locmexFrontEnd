import { Component, OnInit, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonSpinner, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, speedometerOutline, batteryHalfOutline, powerOutline, eyeOutline, listOutline, gridOutline, closeOutline } from 'ionicons/icons';
import { VehicleSelectionService } from '../../../services/vehicle-selection';
import { VehicleService, SidebarUnit } from '../../../vehicles/services/vehicle.service';

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
  
  vehicles = signal<Vehicle[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private readonly menuController = inject(MenuController);
  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private readonly vehicleService = inject(VehicleService);

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
  }

  loadVehicles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.vehicleService.getSidebarUnits().subscribe({
      next: (response: SidebarUnit[]) => {
        const mappedVehicles = response.map(v => this.mapSidebarUnit(v));
        this.vehicles.set(mappedVehicles);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar vehículos:', err);
        this.error.set('Error al cargar los vehículos. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  private mapSidebarUnit(unit: SidebarUnit): Vehicle {
    const status = this.getStatusFromCode(unit.statusCode, unit.ignitionOn);
    return {
      id: unit.deviceId,
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

    if (diffMins < 1) return 'Hace Ahora';
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
