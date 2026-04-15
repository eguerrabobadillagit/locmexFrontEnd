import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, catchError, of } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { 
  PublicTrackingInfo, 
  PublicTrackingPosition, 
  TrackingPositionEvent 
} from '../interfaces/public-tracking.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PublicTrackingRealtimeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly hubUrl = environment.hubUrl;
  
  // SignalR connection
  private hubConnection: signalR.HubConnection | null = null;
  private isConnected = signal(false);
  
  // Estado actual
  private currentPosition$ = new BehaviorSubject<TrackingPositionEvent | null>(null);
  public position$ = this.currentPosition$.asObservable();
  
  // Fallback polling
  private pollingInterval: any = null;
  private currentToken: string | null = null;

  /**
   * 1. Validar token y obtener info básica
   * GET /api/public/tracking/{token}
   */
  validateToken(token: string): Observable<PublicTrackingInfo> {
    return this.http.get<PublicTrackingInfo>(`${this.apiUrl}/public/tracking/${token}`);
  }

  /**
   * 2. Obtener posición inicial
   * GET /api/public/tracking/{token}/position
   */
  getInitialPosition(token: string): Observable<PublicTrackingPosition> {
    return this.http.get<PublicTrackingPosition>(`${this.apiUrl}/public/tracking/${token}/position`);
  }

  /**
   * 3. Conectar a SignalR hub público
   */
  async connectToHub(token: string): Promise<void> {
    this.currentToken = token;

    // Crear conexión
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/hubs/public-tracking`, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Retry delays: 0s, 2s, 5s, 10s, 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 5000;
          if (retryContext.previousRetryCount === 3) return 10000;
          return 30000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Event handlers
    this.setupEventHandlers();

    try {
      // Conectar
      await this.hubConnection.start();
      console.log('✅ SignalR conectado al hub público');
      this.isConnected.set(true);

      // Suscribirse con el token
      await this.hubConnection.invoke('Subscribe', token);
      console.log('✅ Suscrito al tracking del token:', token);

      // Detener polling si estaba activo
      this.stopPolling();

    } catch (error) {
      console.error('❌ Error conectando a SignalR:', error);
      this.isConnected.set(false);
      
      // Iniciar fallback polling
      this.startPolling(token);
    }
  }

  /**
   * 4. Configurar event handlers de SignalR
   */
  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Log de TODOS los mensajes para debug
    (this.hubConnection as any).on = new Proxy((this.hubConnection as any).on, {
      apply: (target: any, thisArg: any, args: any[]) => {
        console.log('🔔 SignalR evento registrado:', args[0]);
        return target.apply(thisArg, args);
      }
    });

    // Escuchar evento de posición
    this.hubConnection.on('tracking:position', (payload: TrackingPositionEvent) => {
      console.log('📍 Nueva posición recibida:', payload);
      this.currentPosition$.next(payload);
    });

    // Intentar otros nombres de evento posibles
    this.hubConnection.on('position', (payload: any) => {
      console.log('📍 Posición recibida (evento "position"):', payload);
      this.currentPosition$.next(payload);
    });

    this.hubConnection.on('PositionUpdate', (payload: any) => {
      console.log('📍 Posición recibida (evento "PositionUpdate"):', payload);
      this.currentPosition$.next(payload);
    });

    // Log de cualquier otro evento que llegue
    this.hubConnection.onclose((error) => {
      console.log('❌ Hub cerrado:', error);
    });

    // Reconexión exitosa
    this.hubConnection.onreconnected(() => {
      console.log('✅ SignalR reconectado');
      this.isConnected.set(true);
      
      // Re-suscribirse
      if (this.currentToken) {
        this.hubConnection?.invoke('Subscribe', this.currentToken)
          .catch(err => console.error('Error re-suscribiendo:', err));
      }
      
      // Detener polling
      this.stopPolling();
    });

    // Reconectando
    this.hubConnection.onreconnecting(() => {
      console.log('🔄 SignalR reconectando...');
      this.isConnected.set(false);
      
      // Iniciar polling mientras reconecta
      if (this.currentToken) {
        this.startPolling(this.currentToken);
      }
    });

    // Desconectado
    this.hubConnection.onclose(() => {
      console.log('❌ SignalR desconectado');
      this.isConnected.set(false);
      
      // Iniciar polling
      if (this.currentToken) {
        this.startPolling(this.currentToken);
      }
    });
  }

  /**
   * 5. Fallback: Polling cada 15 segundos
   */
  private startPolling(token: string): void {
    if (this.pollingInterval) return; // Ya está activo

    console.log('🔄 Iniciando polling fallback (cada 15s)');
    
    this.pollingInterval = setInterval(() => {
      this.getInitialPosition(token).pipe(
        catchError(error => {
          console.error('Error en polling:', error);
          return of(null);
        })
      ).subscribe(position => {
        if (position) {
          this.currentPosition$.next(position);
        }
      });
    }, 15000); // 15 segundos
  }

  /**
   * 6. Detener polling
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log('⏹️ Deteniendo polling fallback');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * 7. Desconectar y limpiar
   */
  async disconnect(): Promise<void> {
    this.stopPolling();
    
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('✅ SignalR desconectado correctamente');
      } catch (error) {
        console.error('Error desconectando SignalR:', error);
      }
      this.hubConnection = null;
    }
    
    this.isConnected.set(false);
    this.currentToken = null;
    this.currentPosition$.next(null);
  }

  /**
   * Estado de conexión
   */
  getConnectionState(): boolean {
    return this.isConnected();
  }
}
