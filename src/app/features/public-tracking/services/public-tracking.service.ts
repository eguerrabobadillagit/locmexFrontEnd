import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PublicTrackingToken {
  token: string;
  vehicleId: string;
  expiresAt: string;
  isValid: boolean;
}

export interface PublicVehicleData {
  id: string;
  plate: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  status: string;
  lastUpdate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicTrackingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private intervalId: any = null;

  // Signal para datos del vehículo
  vehicleData = signal<PublicVehicleData | null>(null);
  
  // Signal para estado de carga
  isLoading = signal<boolean>(false);
  
  // Signal para errores
  error = signal<string | null>(null);

  // BehaviorSubject para WebSocket updates
  private vehicleUpdates$ = new BehaviorSubject<PublicVehicleData | null>(null);

  /**
   * Valida el token y obtiene información inicial del vehículo
   */
  validateToken(token: string): Observable<PublicTrackingToken> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<PublicTrackingToken>(`${this.apiUrl}/public/tracking/validate/${token}`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set('Token inválido o expirado');
        throw error;
      })
    );
  }

  /**
   * Obtiene los datos actuales del vehículo usando el token
   */
  getVehicleData(token: string): Observable<PublicVehicleData> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<PublicVehicleData>(`${this.apiUrl}/public/tracking/${token}`).pipe(
      tap(data => {
        this.vehicleData.set(data);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set('Error al obtener datos del vehículo');
        throw error;
      })
    );
  }

  /**
   * Conecta al WebSocket para recibir actualizaciones en tiempo real
   */
  connectWebSocket(token: string): void {
    // Limpiar intervalo anterior si existe para prevenir duplicados
    this.disconnectWebSocket();

    // TODO: Implementar conexión WebSocket específica para tracking público
    // Por ahora, usaremos polling cada 5 segundos
    this.intervalId = setInterval(() => {
      this.getVehicleData(token).subscribe();
    }, 5000);
  }

  /**
   * Desconecta del WebSocket
   */
  disconnectWebSocket(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Limpia el estado del servicio
   */
  clear(): void {
    this.vehicleData.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }
}
