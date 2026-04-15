import { Component, input, output, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { VehicleDetail } from '../../../map/interfaces/vehicle-detail.interface';
import { GeocodingService } from '../../../map/service/geocoding.service';
import { VehicleAlertsComponent } from '../vehicle-alerts/vehicle-alerts.component';
import { GenerateLinkModalComponent } from '../../../public-tracking/components/generate-link-modal/generate-link-modal.component';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  createOutline,
  locationOutline,
  shareOutline,
  expandOutline,
  speedometerOutline,
  waterOutline,
  compassOutline,
  timeOutline,
  eyeOutline
} from 'ionicons/icons';

// Registrar iconos
addIcons({
  'close-outline': closeOutline,
  'create-outline': createOutline,
  'location-outline': locationOutline,
  'share-outline': shareOutline,
  'expand-outline': expandOutline,
  'speedometer-outline': speedometerOutline,
  'water-outline': waterOutline,
  'compass-outline': compassOutline,
  'time-outline': timeOutline,
  'eye-outline': eyeOutline
});

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonCard,
    IonCardContent,
    VehicleAlertsComponent,
    GenerateLinkModalComponent
  ]
})
export class VehicleDetailComponent {
  private geocodingService = inject(GeocodingService);

  vehicle = input<VehicleDetail | null>(null);
  close = output<void>();

  address = signal<string>('Cargando ubicación...');
  
  // Signals para el modal de compartir
  showShareModal = signal<boolean>(false);

  constructor() {
    effect(() => {
      const v = this.vehicle();
      if (v && v.latitude && v.longitude) {
        this.loadAddress(v.latitude, v.longitude);
      } else {
        this.address.set('Ubicación no disponible');
      }
    });
  }

  private async loadAddress(lat: number, lng: number): Promise<void> {
    if (lat === 0 && lng === 0) {
      this.address.set('Sin ubicación GPS');
      return;
    }

    try {
      const result = await this.geocodingService.getAddressFromCoordinates(lat, lng);
      if (result) {
        this.address.set(result.formattedAddress);
      } else {
        this.address.set('Ubicación disponible en el mapa');
      }
    } catch (error) {
      this.address.set('Ubicación disponible en el mapa');
    }
  }

  // Segmento activo: 'info' | 'alertas'
  activeSegment: 'info' | 'alertas' = 'info';

  ngOnInit(): void {
    // Inicialización del componente
  }

  onSegmentChange(value: 'info' | 'alertas'): void {
    this.activeSegment = value;
  }

  onClose() {
    this.close.emit();
  }

  onEdit() {
    // TODO: Implementar edición de vehículo
  }

  onLocate() {
    // TODO: Implementar ubicación de vehículo
  }

  onShare() {
    this.showShareModal.set(true);
  }

  onCloseShareModal() {
    this.showShareModal.set(false);
  }

  onExpand() {
    // TODO: Implementar ampliar vehículo
  }

  getStatusClass(): string {
    const vehicle = this.vehicle();
    if (!vehicle) return '';

    if (vehicle.status === 'In_route') return 'status-in-route';
    if (vehicle.status === 'Stopped') return 'status-stopped';
    return 'status-no-signal';
  }

  getStatusText(): string {
    const vehicle = this.vehicle();
    if (!vehicle) return '';

    if (vehicle.status === 'In_route') return 'En ruta';
    if (vehicle.status === 'Stopped') return 'Detenido';
    return 'Sin señal';
  }
}
