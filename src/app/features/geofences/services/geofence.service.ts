import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateGeofenceRequest, UpdateGeofenceRequest, GeofenceResponse } from '../interfaces/geofence-request.interface';

@Injectable({
  providedIn: 'root'
})
export class GeofenceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/geofences`;

  // Signals para estado
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly geofences = signal<GeofenceResponse[]>([]);
  readonly lastCreatedGeofence = signal<GeofenceResponse | null>(null);

  getGeofences(): Observable<GeofenceResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<GeofenceResponse[]>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          this.geofences.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las geocercas');
          this.isLoading.set(false);
        }
      })
    );
  }

  getGeofenceById(id: string): Observable<GeofenceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<GeofenceResponse>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar la geocerca');
          this.isLoading.set(false);
        }
      })
    );
  }

  getGeofencesByClient(clientId: string): Observable<GeofenceResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<GeofenceResponse[]>(`${this.apiUrl}/client/${clientId}`).pipe(
      tap({
        next: (response) => {
          this.geofences.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las geocercas del cliente');
          this.isLoading.set(false);
        }
      })
    );
  }

  createGeofence(geofence: CreateGeofenceRequest): Observable<GeofenceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<GeofenceResponse>(this.apiUrl, geofence).pipe(
      tap({
        next: (response) => {
          this.lastCreatedGeofence.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al crear la geocerca');
          this.isLoading.set(false);
        }
      })
    );
  }

  updateGeofence(id: string, geofence: UpdateGeofenceRequest): Observable<GeofenceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<GeofenceResponse>(`${this.apiUrl}/${id}`, geofence).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al actualizar la geocerca');
          this.isLoading.set(false);
        }
      })
    );
  }

  deleteGeofence(id: string): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al eliminar la geocerca');
          this.isLoading.set(false);
        }
      })
    );
  }

  clearError(): void {
    this.error.set(null);
  }

  clearLastCreatedGeofence(): void {
    this.lastCreatedGeofence.set(null);
  }
}
