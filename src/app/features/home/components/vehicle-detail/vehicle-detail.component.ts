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
    // TODO: Implementar compartir vehículo
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
