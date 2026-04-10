import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VehicleHistoryPoint, VehicleHistoryRequest } from '../interfaces/vehicle-history.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  getVehicleHistory(request: VehicleHistoryRequest): Observable<VehicleHistoryPoint[]> {
    const params = new HttpParams()
      .set('FromUtc', request.fromUtc)
      .set('ToUtc', request.toUtc);

    return this.http.get<VehicleHistoryPoint[]>(
      `${this.apiUrl}/${request.vehicleId}/history`,
      { params }
    );
  }
}
