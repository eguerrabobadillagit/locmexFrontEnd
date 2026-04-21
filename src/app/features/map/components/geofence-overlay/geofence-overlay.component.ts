import { Component, OnDestroy, effect, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeofenceService } from '../../../geofences/services/geofence.service';
import { GeofenceVisibilityService } from '../../../services/geofence-visibility.service';
import { GeofenceDrawingService } from '../../../geofences/services/geofence-drawing.service';

@Component({
  selector: 'app-geofence-overlay',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styles: []
})
export class GeofenceOverlayComponent implements OnDestroy {
  // Inputs
  map = input.required<google.maps.Map>();

  // Private state
  private geofenceOverlays: Map<string, google.maps.Circle | google.maps.Polygon> = new Map();

  private readonly geofenceService = inject(GeofenceService);
  private readonly geofenceVisibilityService = inject(GeofenceVisibilityService);
  private readonly geofenceDrawingService = inject(GeofenceDrawingService);

  constructor() {
    // Effect to handle visibility changes from the service
    effect(() => {
      const visibleIds = this.geofenceVisibilityService.getActuallyVisibleGeofences();
      const shouldHide = this.geofenceDrawingService.shouldHideGeofences();
      const mapInstance = this.map();

      console.log('[GeofenceOverlay] Visibility effect:', {
        visibleIds: Array.from(visibleIds),
        shouldHide,
        hasMap: !!mapInstance
      });

      if (mapInstance) {
        if (shouldHide) {
          // Ocultar todas las geocercas cuando se está dibujando
          this.clearGeofences();
        } else {
          this.updateGeofenceVisibility(mapInstance, visibleIds);
        }
      }
    });

    // Effect to handle geofence data changes (create/update/delete)
    effect(() => {
      const geofences = this.geofenceService.geofences(); // Signal dependency - triggers on change
      const shouldHide = this.geofenceDrawingService.shouldHideGeofences();
      const mapInstance = this.map();

      console.log('[GeofenceOverlay] Data change effect:', {
        geofenceCount: geofences.length,
        shouldHide,
        hasMap: !!mapInstance
      });

      if (mapInstance && !shouldHide) {
        // Re-render geofences when data changes, respecting visibility
        // Pero solo si no se está dibujando
        this.renderGeofences(mapInstance);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearGeofences();
  }

  private updateGeofenceVisibility(map: google.maps.Map, visibleIds: Set<string>): void {
    // Hide geofences that are no longer visible
    this.geofenceOverlays.forEach((overlay, id) => {
      if (!visibleIds.has(id)) {
        overlay.setMap(null);
      } else if (overlay.getMap() === null) {
        // Show if it was hidden and is now visible
        overlay.setMap(map);
      }
    });

    // Render any new visible geofences that don't have overlays yet
    const geofences = this.geofenceService.geofences();
    geofences.forEach(geofence => {
      if (visibleIds.has(geofence.id) && !this.geofenceOverlays.has(geofence.id)) {
        this.renderSingleGeofence(map, geofence);
      }
    });
  }

  private renderGeofences(map: google.maps.Map): void {
    const geofences = this.geofenceService.geofences();
    const actuallyVisibleIds = this.geofenceVisibilityService.getActuallyVisibleGeofences();

    console.log('[GeofenceOverlay] renderGeofences:', {
      totalGeofences: geofences.length,
      actuallyVisible: Array.from(actuallyVisibleIds)
    });

    // Clear overlays for geofences that no longer exist
    const currentIds = new Set(geofences.map(g => g.id));
    this.geofenceOverlays.forEach((overlay, id) => {
      if (!currentIds.has(id)) {
        overlay.setMap(null);
        this.geofenceOverlays.delete(id);
      }
    });

    // Render visible geofences
    geofences.forEach(geofence => {
      if (actuallyVisibleIds.has(geofence.id)) {
        if (!this.geofenceOverlays.has(geofence.id)) {
          this.renderSingleGeofence(map, geofence);
        } else {
          // Make sure it's visible on map
          const overlay = this.geofenceOverlays.get(geofence.id);
          if (overlay && overlay.getMap() === null) {
            overlay.setMap(map);
          }
        }
      } else {
        // Hide if not visible
        const overlay = this.geofenceOverlays.get(geofence.id);
        if (overlay) {
          overlay.setMap(null);
        }
      }
    });
  }

  private renderSingleGeofence(map: google.maps.Map, geofence: { id: string; geoJson: string; geometryType: string; name: string }): void {
    try {
      const geoJson = JSON.parse(geofence.geoJson);

      if (geofence.geometryType === 'circle' && geoJson.type === 'Point') {
        // Render circle
        const circle = new google.maps.Circle({
          center: { lat: geoJson.coordinates[1], lng: geoJson.coordinates[0] },
          radius: geoJson.properties?.radius || 100,
          strokeColor: '#4CAF50',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#4CAF50',
          fillOpacity: 0.2,
          map: map
        });
        this.geofenceOverlays.set(geofence.id, circle);

      } else if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
        // Render polygon or multipolygon
        let coordinates;

        if (geoJson.type === 'Polygon') {
          coordinates = geoJson.coordinates[0].map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0]
          }));
        } else {
          // MultiPolygon - take first polygon
          coordinates = geoJson.coordinates[0][0].map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0]
          }));
        }

        const polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: '#4CAF50',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#4CAF50',
          fillOpacity: 0.2,
          map: map
        });
        this.geofenceOverlays.set(geofence.id, polygon);

      } else {
        console.warn('Tipo de geocerca no soportado:', geoJson.type);
      }
    } catch (error) {
      console.error('Error al renderizar geocerca:', geofence.name, error);
    }
  }

  private clearGeofences(): void {
    this.geofenceOverlays.forEach(overlay => {
      overlay.setMap(null);
    });
    this.geofenceOverlays.clear();
  }
}
