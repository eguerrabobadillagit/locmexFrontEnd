import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';
import { PublicMapComponent } from './components/public-map/public-map.component';
import { PublicTrackingService } from './services/public-tracking.service';

@Component({
  selector: 'app-public-tracking',
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonIcon, PublicMapComponent],
  templateUrl: './public-tracking.page.html',
  styleUrls: ['./public-tracking.page.scss']
})
export class PublicTrackingPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly trackingService = inject(PublicTrackingService);
  
  private token: string = '';

  constructor() {
    addIcons({ alertCircleOutline });
  }

  ngOnInit(): void {
    // Obtener el token de la URL
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    if (this.token) {
      // Cargar datos iniciales del vehículo
      this.trackingService.getVehicleData(this.token).subscribe({
        next: () => {
          // Conectar al WebSocket para actualizaciones en tiempo real
          this.trackingService.connectWebSocket(this.token);
        },
        error: (error) => {
          console.error('Error al cargar datos del vehículo:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Desconectar WebSocket y limpiar estado
    this.trackingService.disconnectWebSocket();
    this.trackingService.clear();
  }
}
