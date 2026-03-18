import { Component, input, output } from '@angular/core';
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
import { VehicleDetail } from '../../../map/interfaces/vehicle-detail.interface';

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
    IonCardContent
  ]
})
export class VehicleDetailComponent {
  vehicle = input<VehicleDetail | null>(null);
  close = output<void>();

  constructor() {
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
  }

  onClose() {
    this.close.emit();
  }

  onEdit() {
    console.log('Editar vehículo:', this.vehicle()?.id);
  }

  onLocate() {
    console.log('Ubicar vehículo:', this.vehicle()?.id);
  }

  onShare() {
    console.log('Compartir vehículo:', this.vehicle()?.id);
  }

  onExpand() {
    console.log('Ampliar vehículo:', this.vehicle()?.id);
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
