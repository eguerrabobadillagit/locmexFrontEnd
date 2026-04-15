import { Component, OnInit, OnDestroy, inject, signal, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  speedometerOutline, timeOutline, closeOutline,
  powerOutline, locationOutline, informationCircleOutline
} from 'ionicons/icons';
import { PublicTrackingRealtimeService } from '../../services/public-tracking-realtime.service';
import { 
  PublicTrackingInfo, 
  PublicTrackingPosition, 
  TrackingPositionEvent 
} from '../../interfaces/public-tracking.interfaces';

@Component({
  selector: 'app-public-tracking-page',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMap, MapMarker,
    IonSpinner, IonIcon
  ],
  templateUrl: './public-tracking-page.component.html',
  styleUrls: ['./public-tracking-page.component.scss']
})
export class PublicTrackingPageComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap) map?: GoogleMap;

  private readonly route = inject(ActivatedRoute);
  private readonly trackingService = inject(PublicTrackingRealtimeService);

  // Estado
  token = signal<string>('');
  trackingInfo = signal<PublicTrackingInfo | null>(null);
  currentPosition = signal<TrackingPositionEvent | null>(null);
  isLoading = signal(true);
  isConnected = signal(false);
  error = signal<string | null>(null);
  isPanelOpen = signal(false);

  // Configuración del mapa
  mapOptions: google.maps.MapOptions = {
    center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México por defecto
    zoom: 15,
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  };

  // Marcador del vehículo
  markerPosition = signal<google.maps.LatLngLiteral | null>(null);
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  constructor() {
    addIcons({ 
      speedometerOutline, timeOutline, closeOutline,
      powerOutline, locationOutline, informationCircleOutline
    });

    // Effect para actualizar el mapa cuando cambie la posición
    effect(() => {
      const position = this.currentPosition();
      if (position && position.latitude && position.longitude) {
        this.updateMapPosition(position.latitude, position.longitude);
      }
    });
  }

  async ngOnInit() {
    // 1. Obtener token del URL
    const tokenParam = this.route.snapshot.paramMap.get('token');
    if (!tokenParam) {
      this.error.set('Token no encontrado en la URL');
      this.isLoading.set(false);
      return;
    }
    this.token.set(tokenParam);

    try {
      // 2. Validar token y obtener info básica
      const info = await this.trackingService.validateToken(this.token()).toPromise();
      if (info) {
        this.trackingInfo.set(info);
      }

      // 3. Obtener posición inicial
      const position = await this.trackingService.getInitialPosition(this.token()).toPromise();
      if (position) {
        this.currentPosition.set(position);
      }

      this.isLoading.set(false);

      // 4. Conectar a SignalR
      await this.trackingService.connectToHub(this.token());
      this.isConnected.set(true);

      // 5. Escuchar actualizaciones en tiempo real
      this.trackingService.position$.subscribe(newPosition => {
        if (newPosition) {
          this.currentPosition.set(newPosition);
        }
      });

    } catch (err: any) {
      console.error('Error inicializando tracking:', err);
      this.error.set(err.message || 'Error cargando datos de tracking');
      this.isLoading.set(false);
    }
  }

  /**
   * Actualizar posición del mapa y marcador
   */
  private updateMapPosition(lat: number, lng: number): void {
    const newPosition = { lat, lng };
    
    // Actualizar marcador
    this.markerPosition.set(newPosition);
    
    // Centrar mapa en la nueva posición
    if (this.map?.googleMap) {
      this.map.googleMap.panTo(newPosition);
    }
  }

  /**
   * Abrir/cerrar panel lateral
   */
  togglePanel(): void {
    this.isPanelOpen.set(!this.isPanelOpen());
  }

  async ngOnDestroy() {
    // Desconectar SignalR al salir
    await this.trackingService.disconnect();
  }

  /**
   * Formatear fecha UTC a local
   */
  formatDate(utcDate: string): string {
    return new Date(utcDate).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Calcular tiempo transcurrido
   */
  getTimeAgo(utcDate: string): string {
    const now = new Date();
    const date = new Date(utcDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins === 1) return 'Hace 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hace 1 día';
    return `Hace ${diffDays} días`;
  }
}
