import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreateVehicleRequest, VehicleResponse } from '../interfaces/vehicle-request.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  createVehicle(request: CreateVehicleRequest): Observable<VehicleResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<VehicleResponse>(`${this.apiUrl}/vehicles`, request).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al crear el vehículo');
          this.isLoading.set(false);
        }
      })
    );
  }

  getVehicles(): Observable<VehicleResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<VehicleResponse[]>(`${this.apiUrl}/vehicles`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los vehículos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getVehicleById(id: string): Observable<VehicleResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<VehicleResponse>(`${this.apiUrl}/vehicles/${id}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar el vehículo');
          this.isLoading.set(false);
        }
      })
    );
  }

  updateVehicle(id: string, request: CreateVehicleRequest): Observable<VehicleResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<VehicleResponse>(`${this.apiUrl}/vehicles/${id}`, request).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al actualizar el vehículo');
          this.isLoading.set(false);
        }
      })
    );
  }

  getSidebarUnits(): Observable<SidebarUnit[]> {
    return this.http.get<SidebarUnit[]>(`${this.apiUrl}/realtime/sidebar-units`);
  }
}

export interface SidebarUnit {
  deviceId: string;
  vehicleId?: string;
  unitLabel: string;
  plate: string;
  driverName: string;
  statusCode: string;
  statusSinceUtc: string;
  lastMessageAtUtc: string;
  ignitionOn: boolean;
  speedKph: number | null;
  batteryLevel: number | null;
  latitude: number | null;
  longitude: number | null;
}
