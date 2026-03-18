import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleSelectionService {
  private vehicleSelectedSource = new Subject<string>();
  vehicleSelected$ = this.vehicleSelectedSource.asObservable();

  constructor() { }

  selectVehicle(vehicleId: string) {
    this.vehicleSelectedSource.next(vehicleId);
  }
}
