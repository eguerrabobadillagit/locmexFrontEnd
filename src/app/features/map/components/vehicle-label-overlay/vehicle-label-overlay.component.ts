import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente para renderizar etiquetas de vehículos como HTML overlays en Google Maps
 * Más eficiente que incluir las etiquetas en los iconos PNG
 */
@Component({
  selector: 'app-vehicle-label-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vehicle-labels-container">
      @for (label of labels(); track label.id) {
        <div 
          class="vehicle-label"
          [style.left.px]="label.x"
          [style.top.px]="label.y"
          [attr.data-vehicle-id]="label.id">
          {{ label.text }}
        </div>
      }
    </div>
  `,
  styles: [`
    .vehicle-labels-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }

    .vehicle-label {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 2px;
      font-size: 11px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      white-space: nowrap;
      transform: translate(-50%, -100%);
      margin-top: -38px;
      pointer-events: none;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
  `]
})
export class VehicleLabelOverlayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() map!: google.maps.Map;
  @Input() markers: Array<{ id: string; position: google.maps.LatLngLiteral; title: string }> = [];

  labels = signal<Array<{ id: string; text: string; x: number; y: number }>>([]);

  private projection: google.maps.MapCanvasProjection | null = null;
  private overlay: google.maps.OverlayView | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['markers']) {
      this.updateLabelPositions();
    }
  }

  ngOnInit() {
    this.initializeOverlay();
  }

  ngOnDestroy() {
    if (this.overlay) {
      this.overlay.setMap(null);
    }
  }

  private initializeOverlay() {
    if (!this.map) return;

    // Crear un OverlayView personalizado para obtener la proyección
    this.overlay = new google.maps.OverlayView();
    
    this.overlay.onAdd = () => {
      // Overlay agregado al mapa
    };

    this.overlay.draw = () => {
      this.projection = this.overlay!.getProjection();
      this.updateLabelPositions();
    };

    this.overlay.onRemove = () => {
      this.projection = null;
    };

    this.overlay.setMap(this.map);

    // Actualizar posiciones cuando el mapa se mueve
    this.map.addListener('bounds_changed', () => {
      this.updateLabelPositions();
    });
  }

  private updateLabelPositions() {
    if (!this.projection || !this.markers.length) {
      this.labels.set([]);
      return;
    }

    const newLabels = this.markers.map(marker => {
      const latLng = new google.maps.LatLng(marker.position.lat, marker.position.lng);
      const point = this.projection!.fromLatLngToContainerPixel(latLng);

      return {
        id: marker.id,
        text: marker.title,
        x: point?.x ?? 0,
        y: point?.y ?? 0
      };
    });

    this.labels.set(newLabels);
  }
}
