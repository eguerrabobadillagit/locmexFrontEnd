import { Component, input, output, effect, signal, inject, OnInit } from '@angular/core';
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
  IonCardContent,
  IonModal
} from '@ionic/angular/standalone';
import { FormVehicleWizardComponent } from '../../../vehicles/components/form-vehicle-wizard/form-vehicle-wizard.component';
import { VehicleDetail } from '../../../map/interfaces/vehicle-detail.interface';
import { StreetViewComponent } from '../street-view/street-view.component';
import { StreetViewService } from '../../../services/street-view.service';
import { GeocodingService } from '../../../map/service/geocoding.service';
import { VehicleAlertsComponent } from '../vehicle-alerts/vehicle-alerts.component';
import { GenerateLinkModalComponent } from '../../../public-tracking/components/generate-link-modal/generate-link-modal.component';
import { HeadingPipe } from '../../../../shared/pipes/heading.pipe';
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
  eyeOutline,
  eyeOffOutline,
  chevronForwardOutline
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
  'eye-outline': eyeOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'eye-off-outline': eyeOffOutline
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
    IonModal,
    VehicleAlertsComponent,
    GenerateLinkModalComponent,
    StreetViewComponent,
    FormVehicleWizardComponent,
    HeadingPipe
  ]
})
export class VehicleDetailComponent {
  private geocodingService = inject(GeocodingService);
  private streetViewService = inject(StreetViewService);

  vehicle = input<VehicleDetail | null>(null);
  close = output<void>();
  openStreetViewFullscreen = output<VehicleDetail>();

  showStreetView = signal<boolean>(false);

  address = signal<string>('Cargando ubicación...');

  // Signals para el modal de compartir
  showShareModal = signal<boolean>(false);
  showEditWizard = signal<boolean>(false);

  constructor() {
    effect(() => {
      const v = this.vehicle();
      if (v && v.latitude && v.longitude) {
        this.loadAddress(v.latitude, v.longitude);
      } else {
        this.address.set('Ubicación no disponible');
      }
    });

    effect(() => {
      const req = this.streetViewService.pendingRequest();
      const v = this.vehicle();
      if (req && v && req.plate === v.plate) {
        this.showStreetView.set(true);
        setTimeout(() => this.streetViewService.clearRequest(), 100);
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

  // Segmento activo: 'info' | 'alertas' | 'comandos'
  activeSegment: 'info' | 'alertas' | 'comandos' = 'info';

  ngOnInit(): void {
    // Inicialización del componente
  }

  onSegmentChange(value: 'info' | 'alertas' | 'comandos'): void {
    this.activeSegment = value;
  }

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.showEditWizard.set(true);
  }

  onWizardClose() {
    this.showEditWizard.set(false);
  }

  onVehicleUpdated(_data: any) {
    this.showEditWizard.set(false);
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

  onMonitorImage() {
    this.showStreetView.set(true);
  }

  onStreetViewFullscreen() {
    const v = this.vehicle();
    if (v) this.openStreetViewFullscreen.emit(v);
  }

  onCloseStreetView() {
    this.showStreetView.set(false);
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

  onCommandClick(command: string): void {
    console.log('Comando seleccionado:', command);
    // TODO: Implementar lógica de envío de comandos al dispositivo
  }
}
