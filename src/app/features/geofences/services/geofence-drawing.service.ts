import { Injectable, signal } from '@angular/core';

export type DrawMode = 'circle' | 'polygon' | 'rectangle' | null;

@Injectable({
  providedIn: 'root'
})
export class GeofenceDrawingService {
  // Signals para estado de dibujo
  readonly isDrawing = signal<boolean>(false);
  readonly drawMode = signal<DrawMode>(null);
  readonly drawnGeometry = signal<any>(null);
  readonly shouldHideGeofences = signal<boolean>(false);
  readonly shouldHideVehicles = signal<boolean>(false);

  // Signal para notificar que se completó el dibujo
  readonly drawingCompleted = signal<boolean>(false);

  startDrawing(mode: DrawMode): void {
    this.isDrawing.set(true);
    this.drawMode.set(mode);
    this.shouldHideGeofences.set(true);
    this.shouldHideVehicles.set(true);
    this.drawnGeometry.set(null);
    this.drawingCompleted.set(false);
  }

  stopDrawing(): void {
    this.isDrawing.set(false);
    this.drawMode.set(null);
    this.shouldHideGeofences.set(false);
    this.shouldHideVehicles.set(false);
    this.drawingCompleted.set(false);
  }

  setDrawnGeometry(geometry: any): void {
    this.drawnGeometry.set(geometry);
    this.drawingCompleted.set(true);
  }

  changeDrawMode(mode: DrawMode): void {
    this.drawMode.set(mode);
  }

  clearGeometry(): void {
    this.drawnGeometry.set(null);
    this.drawingCompleted.set(false);
  }
}
