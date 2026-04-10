import { Component, OnInit, AfterViewInit, signal, inject, ViewChild, ElementRef, output, input, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GeofenceService } from '../../services/geofence.service';
import { GeofenceResponse, CreateGeofenceRequest } from '../../interfaces/geofence-request.interface';
import { GeofenceType, GeofenceStatus } from '../../interfaces/geofence.model';
import { 
  TerraDraw,
  TerraDrawCircleMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  TerraDrawRenderMode
} from 'terra-draw';
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter';
import { GeofenceFormComponent, GeofenceFormData } from '../geofence-form/geofence-form.component';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-geofence-map',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    GeofenceFormComponent
  ],
  templateUrl: './geofence-map.component.html',
  styleUrls: ['./geofence-map.component.scss']
})
export class GeofenceMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private readonly geofenceService = inject(GeofenceService);
  private readonly toastService = inject(NgToastService);
  
  // Input
  geofenceToEdit = input<GeofenceResponse | null>(null);
  
  // Output events
  mapClosed = output<void>();
  
  // Form data
  currentFormData = signal<GeofenceFormData | null>(null);

  selectedGeofence = signal<GeofenceResponse | null>(null);
  
  map: google.maps.Map | null = null;
  geofenceOverlays: Map<string, google.maps.Circle | google.maps.Polygon> = new Map();
  
  // TerraDraw
  draw: TerraDraw | null = null;
  currentDrawMode = signal<'select' | 'circle' | 'polygon' | 'rectangle' | null>(null);
  isDrawing = signal<boolean>(false);
  lastDrawnGeofence = signal<any>(null);
  
  // Computed signal to check if a geofence has been drawn
  hasDrawnGeofence = computed(() => this.lastDrawnGeofence() !== null);

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    if (!this.mapContainer) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 19.4326, lng: -99.1332 }, // CDMX
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    // Wait for map to be fully loaded before initializing TerraDraw
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.initializeTerraDraw();
      this.renderGeofences();
      
      // If there's a geofence to edit, load it
      const geofenceToEdit = this.geofenceToEdit();
      if (geofenceToEdit) {
        // Wait a bit more to ensure TerraDraw is fully ready
        setTimeout(() => {
          this.loadGeofenceForEditing(geofenceToEdit);
        }, 300);
      }
    });
  }

  initializeTerraDraw(): void {
    if (!this.map) return;

    const adapter = new TerraDrawGoogleMapsAdapter({
      map: this.map,
      lib: google.maps
    });

    this.draw = new TerraDraw({
      adapter: adapter,
      modes: [
        new TerraDrawSelectMode({
          flags: {
            arbitary: {
              feature: {}
            }
          }
        }),
        new TerraDrawCircleMode({
          validation: () => ({ valid: true })
        }),
        new TerraDrawPolygonMode({
          pointerDistance: 40,
          keyEvents: {
            cancel: 'Escape',
            finish: 'Enter'
          }
        }),
        new TerraDrawRectangleMode({
          validation: () => ({ valid: true })
        }),
        new TerraDrawRenderMode({
          modeName: 'render',
          styles: {
            polygonFillColor: '#3b82f6',
            polygonOutlineColor: '#1e40af',
            polygonOutlineWidth: 2,
            polygonFillOpacity: 0.3,
            pointColor: '#3b82f6',
            pointOutlineColor: '#ffffff',
            pointOutlineWidth: 2,
            pointWidth: 6
          }
        })
      ]
    });

    this.draw.start();
    
    // Si está en modo edición, no permitir dibujar
    const isEditMode = this.geofenceToEdit() !== null;
    if (isEditMode) {
      this.draw.setMode('select');
      this.currentDrawMode.set('select');
      this.isDrawing.set(false);
    } else {
      this.draw.setMode('circle');
      this.currentDrawMode.set('circle');
      this.isDrawing.set(true);
    }

    // Listen to finish event (when drawing is completed)
    this.draw.on('finish', (id) => {

      // Get all features
      const snapshot = this.draw!.getSnapshot();
      
      // If there are more than 1 features, keep only the last one (the one just finished)
      if (snapshot.length > 1) {
        // Get all feature IDs except the one just finished
        const featuresToDelete = snapshot
          .filter(f => f.id !== id)
          .map(f => f.id);
        
        // Delete old features
        this.draw!.removeFeatures(featuresToDelete);

      }
      
      this.onGeofenceDrawn(id);
    });
  }

  onGeofenceDrawn(id: string | number): void {
    if (!this.draw) return;

    const snapshot = this.draw.getSnapshot();
    const feature = snapshot.find(f => f.id === id);
    
    if (feature) {
      // Save the last drawn geofence
      this.lastDrawnGeofence.set(feature);

    }
  }

  saveCurrentGeofence(): void {
    const feature = this.lastDrawnGeofence();
    
    if (!feature) {
      console.error('No hay geocerca para guardar');
      return;
    }

    // Force mode to be polygon and geometry type to Polygon
    const modifiedFeature = {
      ...feature,
      geometry: {
        ...feature.geometry,
        type: 'Polygon'
      },
      properties: {
        ...feature.properties,
        mode: 'polygon'
      }
    };
    
    // Convert TerraDraw feature to GeoJSON string
    const geoJsonString = JSON.stringify(modifiedFeature);
    
    // Prepare data for API
    const geofenceData: CreateGeofenceRequest = {
      clientId: '20000000-0000-0000-0000-000000000001',
      name: `Geocerca ${new Date().toLocaleString()}`,
      description: feature.geometry.type === 'Polygon' ? 'Geocerca poligonal' : 'Geocerca circular',
      geoJson: geoJsonString,
      geometryType: feature.properties?.mode === 'circle' ? 'circle' : 'polygon',
      alertOnEnter: true,
      alertOnExit: true
    };

    // Send to backend
    this.geofenceService.createGeofence(geofenceData).subscribe({
      next: (response) => {

        this.toastService.success('Geocerca guardada exitosamente', 'Éxito');
        
        // Clear the drawing
        this.clearDrawing();
        this.lastDrawnGeofence.set(null);
        
        // Reload geofences
        this.renderGeofences();
      },
      error: (error) => {
        console.error('Error al guardar geocerca:', error);
        this.toastService.danger('Error al guardar geocerca: ' + (error.message || 'Error desconocido'), 'Error');
      }
    });
  }

  setDrawMode(mode: 'select' | 'circle' | 'polygon' | 'rectangle'): void {
    if (!this.draw) return;

    this.draw.setMode(mode);
    this.currentDrawMode.set(mode);
    this.isDrawing.set(mode !== 'select');
  }

  clearDrawing(): void {
    if (!this.draw) return;

    this.draw.clear();
    this.setDrawMode('select');
  }

  onCancel(): void {
    this.mapClosed.emit();
  }

  onFormShapeTypeChange(shapeType: 'circular' | 'polygon' | 'rectangle'): void {
    if (!this.draw) return;
    
    // No permitir cambio de modo si está en edición
    const isEditMode = this.geofenceToEdit() !== null;
    if (isEditMode) return;

    // Map form shape types to TerraDraw modes
    const modeMap = {
      'circular': 'circle',
      'polygon': 'polygon',
      'rectangle': 'rectangle'
    } as const;

    const mode = modeMap[shapeType] as 'circle' | 'polygon' | 'rectangle';
    this.setDrawMode(mode);
  }

  onFormSave(formData: GeofenceFormData): void {
    this.currentFormData.set(formData);
    
    const geofenceToEdit = this.geofenceToEdit();
    const isEditMode = geofenceToEdit !== null;
    
    // En modo edición, no se requiere feature dibujado
    if (!isEditMode) {
      const feature = this.lastDrawnGeofence();
      if (!feature) {
        console.error('No hay geocerca dibujada para guardar');
        this.toastService.warning('Por favor dibuja una geocerca en el mapa antes de guardar', 'Atención');
        return;
      }
    }

    if (isEditMode) {
      // Modo edición: usar PUT
      const updateData: any = {
        id: geofenceToEdit.id,
        name: formData.name,
        alertOnEnter: formData.alertOnEnter,
        alertOnExit: formData.alertOnExit,
        isActive: formData.isActive,
        vehicleId: formData.vehicleIds && formData.vehicleIds.length > 0 ? formData.vehicleIds[0] : undefined
      };

      this.geofenceService.updateGeofence(geofenceToEdit.id, updateData).subscribe({
        next: (response) => {

          this.toastService.success('Geocerca actualizada exitosamente', 'Éxito');
          
          // Close map and return to grid
          this.mapClosed.emit();
        },
        error: (error) => {
          console.error('Error al actualizar geocerca:', error);
          this.toastService.danger('Error al actualizar geocerca: ' + (error.message || 'Error desconocido'), 'Error');
        }
      });
    } else {
      // Modo creación: usar POST
      const feature = this.lastDrawnGeofence()!;
      
      // Force mode to be polygon and geometry type to Polygon
      const modifiedFeature = {
        ...feature,
        geometry: {
          ...feature.geometry,
          type: 'Polygon'
        },
        properties: {
          ...feature.properties,
          mode: 'polygon'
        }
      };
      
      // Convert TerraDraw feature to GeoJSON string
      const geoJsonString = JSON.stringify(modifiedFeature);
      
      // Map shapeType to geometryType
      const geometryTypeMap: Record<string, string> = {
        'circular': 'circle',
        'polygon': 'polygon',
        'rectangle': 'rectangle'
      };
      
      // Prepare data for API using form data
      const geofenceData: CreateGeofenceRequest = {
        clientId: '20000000-0000-0000-0000-000000000001',
        name: formData.name,
        description: `Geocerca ${formData.shapeType}`,
        geoJson: geoJsonString,
        geometryType: geometryTypeMap[formData.shapeType] || 'polygon',
        alertOnEnter: formData.alertOnEnter,
        alertOnExit: formData.alertOnExit,
        vehicleId: formData.vehicleIds && formData.vehicleIds.length > 0 ? formData.vehicleIds[0] : undefined
      };

      this.geofenceService.createGeofence(geofenceData).subscribe({
        next: (response) => {

          this.toastService.success('Geocerca creada exitosamente', 'Éxito');
          
          // Clear the drawing
          this.clearDrawing();
          this.lastDrawnGeofence.set(null);
          this.currentFormData.set(null);
          
          // Close map and return to grid
          this.mapClosed.emit();
        },
        error: (error) => {
          console.error('Error al crear geocerca:', error);
          this.toastService.danger('Error al crear geocerca: ' + (error.message || 'Error desconocido'), 'Error');
        }
      });
    }
  }

  onFormCancel(): void {
    this.clearDrawing();
    this.mapClosed.emit();
  }

  loadGeofenceForEditing(geofence: GeofenceResponse): void {
    if (!this.map || !this.draw) return;

    try {
      // Parse GeoJSON
      const geoJsonData = JSON.parse(geofence.geoJson);
      
      // Clear existing drawings
      this.draw.clear();
      
      // Add the geofence to TerraDraw
      const feature = {
        type: 'Feature',
        geometry: geoJsonData,
        properties: {
          mode: geoJsonData.type === 'Polygon' ? 'polygon' : 'circle'
        }
      };
      
      // Add feature to TerraDraw
      this.draw.addFeatures([feature]);
      
      // Calculate center and zoom to geofence
      let centerLat = 0;
      let centerLng = 0;
      let pointCount = 0;
      
      if (geoJsonData.type === 'Polygon' && geoJsonData.coordinates) {
        const coords = geoJsonData.coordinates[0];
        coords.forEach((coord: [number, number]) => {
          centerLng += coord[0];
          centerLat += coord[1];
          pointCount++;
        });
      } else if (geoJsonData.type === 'MultiPolygon' && geoJsonData.coordinates) {
        const coords = geoJsonData.coordinates[0][0];
        coords.forEach((coord: [number, number]) => {
          centerLng += coord[0];
          centerLat += coord[1];
          pointCount++;
        });
      }
      
      if (pointCount > 0) {
        centerLat /= pointCount;
        centerLng /= pointCount;
        
        // Center map on geofence
        this.map.setCenter({ lat: centerLat, lng: centerLng });
        this.map.setZoom(14);
      }
      
      // Store as last drawn geofence
      this.lastDrawnGeofence.set(feature);

    } catch (error) {
      console.error('Error al cargar geocerca para edición:', error);
      this.toastService.danger('Error al cargar la geocerca para edición', 'Error');
    }
  }

  renderGeofences(): void {
    if (!this.map) return;

    // Clear existing overlays
    this.geofenceOverlays.forEach(overlay => {
      if (overlay instanceof google.maps.Circle) {
        overlay.setMap(null);
      } else if (overlay instanceof google.maps.Polygon) {
        overlay.setMap(null);
      }
    });
    this.geofenceOverlays.clear();

    // Get geofences from service
    const geofences = this.geofenceService.geofences();

    // Render geofences
    geofences.forEach((geofence, index) => {
      try {
        // Parse GeoJSON from backend
        const geoJsonData = JSON.parse(geofence.geoJson);
        const color = this.getColorForIndex(index);
        
        if (geoJsonData.type === 'MultiPolygon' && geoJsonData.coordinates) {
          // MultiPolygon format: [[[[lng, lat], [lng, lat], ...]]]
          geoJsonData.coordinates.forEach((polygonCoords: any) => {
            const paths = polygonCoords[0].map((coord: [number, number]) => ({
              lat: coord[1],
              lng: coord[0]
            }));

            const polygon = new google.maps.Polygon({
              paths: paths,
              fillColor: color,
              fillOpacity: 0.2,
              strokeColor: color,
              strokeWeight: 2,
              map: this.map!,
              clickable: true
            });

            polygon.addListener('click', () => this.onGeofenceClick(geofence));
            this.geofenceOverlays.set(geofence.id, polygon);
          });
        } else if (geoJsonData.type === 'Polygon' && geoJsonData.coordinates) {
          // Polygon format: [[[lng, lat], [lng, lat], ...]]
          const paths = geoJsonData.coordinates[0].map((coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0]
          }));

          const polygon = new google.maps.Polygon({
            paths: paths,
            fillColor: color,
            fillOpacity: 0.2,
            strokeColor: color,
            strokeWeight: 2,
            map: this.map!,
            clickable: true
          });

          polygon.addListener('click', () => this.onGeofenceClick(geofence));
          this.geofenceOverlays.set(geofence.id, polygon);
        }
      } catch (error) {
        console.error('Error al renderizar geocerca:', geofence.name, error);
      }
    });
  }

  private getColorForIndex(index: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    return colors[index % colors.length];
  }

  onGeofenceClick(geofence: GeofenceResponse): void {
    this.selectedGeofence.set(geofence);
    
    // Center map on geofence
    if (this.map) {
      try {
        const geoJsonData = JSON.parse(geofence.geoJson);
        if (geoJsonData.coordinates && geoJsonData.coordinates[0] && geoJsonData.coordinates[0][0]) {
          const firstCoord = geoJsonData.coordinates[0][0][0];
          this.map.setCenter({ lat: firstCoord[1], lng: firstCoord[0] });
          this.map.setZoom(14);
        }
      } catch (error) {
        console.error('Error al centrar mapa:', error);
      }
    }
  }
}
