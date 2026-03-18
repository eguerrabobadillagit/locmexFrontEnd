import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreateDeviceRequest, UpdateDeviceRequest } from '../interfaces/device-request.interface';
import { CreateDeviceResponse, DeviceResponse } from '../interfaces/device-response.interface';
import { CommandRequest, CommandResponse } from '../interfaces/device-command.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/devices`;

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly lastCreatedDevice = signal<CreateDeviceResponse | null>(null);
  readonly devices = signal<DeviceResponse[]>([]);

  createDevice(deviceData: CreateDeviceRequest): Observable<CreateDeviceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<CreateDeviceResponse>(this.apiUrl, deviceData).pipe(
      tap({
        next: (response) => {
          this.lastCreatedDevice.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al crear el dispositivo');
          this.isLoading.set(false);
        }
      })
    );
  }

  clearError(): void {
    this.error.set(null);
  }

  clearLastCreatedDevice(): void {
    this.lastCreatedDevice.set(null);
  }

  getDevices(): Observable<DeviceResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<DeviceResponse[]>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          this.devices.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al obtener los dispositivos');
          this.isLoading.set(false);
        }
      })
    );
  }

  getDeviceById(deviceId: string): Observable<DeviceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<DeviceResponse>(`${this.apiUrl}/${deviceId}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al obtener el dispositivo');
          this.isLoading.set(false);
        }
      })
    );
  }

  updateDevice(deviceId: string, deviceData: UpdateDeviceRequest): Observable<DeviceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<DeviceResponse>(`${this.apiUrl}/${deviceId}`, deviceData).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al actualizar el dispositivo');
          this.isLoading.set(false);
        }
      })
    );
  }

  deleteDevice(deviceId: string): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${deviceId}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al eliminar el dispositivo');
          this.isLoading.set(false);
        }
      })
    );
  }

  sendCommand(deviceId: string, command: CommandRequest): Observable<CommandResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<CommandResponse>(`${this.apiUrl}/${deviceId}/commands`, command).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al enviar el comando al dispositivo');
          this.isLoading.set(false);
        }
      })
    );
  }
}
