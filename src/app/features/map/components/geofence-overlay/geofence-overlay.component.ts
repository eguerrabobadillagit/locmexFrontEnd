import { Component, OnDestroy, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeofenceService } from '../../../geofences/services/geofence.service';

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
  showGeofences = input<boolean>(false);
  
  // Private state
  private geofenceOverlays: (google.maps.Circle | google.maps.Polygon)[] = [];
  
  constructor(private geofenceService: GeofenceService) {
    // Effect to handle show/hide geofences
    effect(() => {
      const shouldShow = this.showGeofences();
      const mapInstance = this.map();
      
      if (shouldShow && mapInstance) {
        this.loadAndRenderGeofences(mapInstance);
      } else {
        this.clearGeofences();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearGeofences();
  }

  private loadAndRenderGeofences(map: google.maps.Map): void {
    // Clear existing overlays first
    this.clearGeofences();
    
    this.geofenceService.getGeofences().subscribe({
      next: () => {
        this.renderGeofences(map);
      },
      error: (error) => {
        console.error('Error al cargar geocercas:', error);
      }
    });
  }

  private renderGeofences(map: google.maps.Map): void {
    const geofences = this.geofenceService.geofences();
    
    console.log(`Renderizando ${geofences.length} geocercas`);

    geofences.forEach(geofence => {
      try {
        const geoJson = JSON.parse(geofence.geoJson);
        console.log('Geocerca:', geofence.name, 'Tipo:', geofence.geometryType, 'GeoJSON type:', geoJson.type);
        
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
          this.geofenceOverlays.push(circle);
          console.log('Círculo renderizado:', geofence.name);
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
          this.geofenceOverlays.push(polygon);
          console.log('Polígono renderizado:', geofence.name);
        } else {
          console.warn('Tipo de geocerca no soportado:', geoJson.type);
        }
      } catch (error) {
        console.error('Error al renderizar geocerca:', geofence.name, error);
      }
    });
    
    console.log(`Total de overlays renderizados: ${this.geofenceOverlays.length}`);
  }

  private clearGeofences(): void {
    this.geofenceOverlays.forEach(overlay => {
      if (overlay instanceof google.maps.Circle) {
        overlay.setMap(null);
      } else if (overlay instanceof google.maps.Polygon) {
        overlay.setMap(null);
      }
    });
    this.geofenceOverlays = [];
  }
}
