import { Injectable } from '@angular/core';
import { VehicleHistoryRequest } from '../interfaces/vehicle-history.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoryDateHelperService {

  getFromDate(request: VehicleHistoryRequest | null): string {
    return request?.fromUtc.split('T')[0] || '';
  }

  getFromHour(request: VehicleHistoryRequest | null): string {
    const fromUtc = request?.fromUtc;
    if (!fromUtc) return '00';
    return fromUtc.split('T')[1]?.split(':')[0] || '00';
  }

  getFromMinute(request: VehicleHistoryRequest | null): string {
    const fromUtc = request?.fromUtc;
    if (!fromUtc) return '00';
    return fromUtc.split('T')[1]?.split(':')[1] || '00';
  }

  getToDate(request: VehicleHistoryRequest | null): string {
    return request?.toUtc.split('T')[0] || '';
  }

  getToHour(request: VehicleHistoryRequest | null): string {
    const toUtc = request?.toUtc;
    if (!toUtc) return '23';
    return toUtc.split('T')[1]?.split(':')[0] || '23';
  }

  getToMinute(request: VehicleHistoryRequest | null): string {
    const toUtc = request?.toUtc;
    if (!toUtc) return '59';
    return toUtc.split('T')[1]?.split(':')[1] || '59';
  }
}
