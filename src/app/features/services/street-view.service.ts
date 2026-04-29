import { Injectable, signal } from '@angular/core';

export interface StreetViewRequest {
  lat: number;
  lng: number;
  plate: string;
}

@Injectable({
  providedIn: 'root'
})
export class StreetViewService {
  readonly pendingRequest = signal<StreetViewRequest | null>(null);

  openStreetView(request: StreetViewRequest): void {
    this.pendingRequest.set(request);
  }

  clearRequest(): void {
    this.pendingRequest.set(null);
  }
}
