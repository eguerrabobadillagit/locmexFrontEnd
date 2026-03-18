import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DeviceBrand, DeviceModel, SimCarrier, VehicleBrand, VehicleType, Driver } from '../interfaces/catalog.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  getDeviceBrands(): Observable<DeviceBrand[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<DeviceBrand[]>(`${this.apiUrl}/catalog/device-brands`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las marcas de dispositivos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getDeviceModels(brandId: string): Observable<DeviceModel[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<DeviceModel[]>(`${this.apiUrl}/catalog/device-models?brandId=${brandId}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los modelos de dispositivos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getSimCarriers(): Observable<SimCarrier[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<SimCarrier[]>(`${this.apiUrl}/catalog/sim-carriers`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las compañías telefónicas');
          this.isLoading.set(false);
        }
      })
    );
  }

  getVehicleBrands(): Observable<VehicleBrand[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<VehicleBrand[]>(`${this.apiUrl}/catalog/vehicle-brands`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las marcas de vehículos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getVehicleTypes(): Observable<VehicleType[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<VehicleType[]>(`${this.apiUrl}/catalog/vehicle-types`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los tipos de vehículos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getDrivers(): Observable<Driver[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Driver[]>(`${this.apiUrl}/catalog/drivers`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los conductores');
          this.isLoading.set(false);
        }
      })
    );
  }
}
