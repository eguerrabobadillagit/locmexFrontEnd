import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert, AlertResponse, UnreadCountResponse } from '../interfaces/alert.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene la lista de alertas con paginación opcional
   * @param viewState - Filtro opcional por estado ('all', 'read', 'unread')
   * @param page - Número de página (default: 1)
   * @param pageSize - Tamaño de página (default: 20)
   */
  getAlerts(viewState?: string, page: number = 1, pageSize: number = 20): Observable<AlertResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (viewState) {
      params = params.set('viewState', viewState);
    }

    return this.http.get<AlertResponse>(`${this.apiUrl}/alerts`, { params });
  }

  // TODO: Implementar cuando exista el endpoint
  // getAlertsByVehicle(vehicleId: string, page?: number, pageSize?: number): Observable<AlertResponse> {
  //   return this.http.get<AlertResponse>(`${this.apiUrl}/alerts/vehicle/${vehicleId}`, {
  //     params: { page: page || 1, pageSize: pageSize || 20 }
  //   });
  // }

  /**
   * Obtiene el conteo de alertas no leídas
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/alerts/unread-count`);
  }

  /**
   * Marca una alerta específica como leída
   * @param alertId - ID de la alerta (alertId, no id)
   */
  markAsRead(alertId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/read`, {});
  }

  /**
   * Marca todas las alertas como leídas
   */
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/read-all`, {});
  }
}
