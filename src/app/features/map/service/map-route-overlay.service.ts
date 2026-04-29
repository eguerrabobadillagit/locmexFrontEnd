import { Injectable } from '@angular/core';
import { RoutePlaybackPoint } from '../interfaces/route-playback-point.interface';
import { createVehicleMarkerIcon, createSpeedBadgeIcon } from '../utils/vehicle-marker-icon.util';
import { getSpeedColor, getSpeedHexColor, VehicleStop } from '../../vehicles/utils/vehicle-history.utils';

@Injectable({
  providedIn: 'root'
})
export class MapRouteOverlayService {
  private routeSegments: google.maps.Polyline[] = [];
  private routeStartMarker: google.maps.Marker | null = null;
  private routeEndMarker: google.maps.Marker | null = null;
  private routeVehicleMarker: google.maps.Marker | null = null;
  private stopMarkers: google.maps.Marker[] = [];
  private speedMarkers: google.maps.Marker[] = [];
  private zoomListener: google.maps.MapsEventListener | null = null;
  private zoomDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastRenderedPoints: RoutePlaybackPoint[] = [];

  renderRoutePolyline(
    map: google.maps.Map,
    points: RoutePlaybackPoint[],
    stops?: VehicleStop[]
  ): void {
    this.clearRouteOverlays();

    // Guardar puntos para re-renderizar al cambiar zoom
    this.lastRenderedPoints = points;

    // Crear segmentos de ruta con colores por velocidad
    this.renderSpeedColoredSegments(map, points);

    // Agregar marcadores de paradas si se proporcionan
    if (stops && stops.length > 0) {
      this.renderStopMarkers(map, stops);
    }

    this.renderSpeedMarkers(map, points);

    // Remover listener anterior si existe
    if (this.zoomListener) {
      google.maps.event.removeListener(this.zoomListener);
      this.zoomListener = null;
    }

    // Agregar listener para re-renderizar badges al cambiar zoom
    this.zoomListener = map.addListener('zoom_changed', () => {
      clearTimeout(this.zoomDebounceTimer!);
      this.zoomDebounceTimer = setTimeout(() => {
        this.renderSpeedMarkers(map, this.lastRenderedPoints);
      }, 200);
    });

    this.routeStartMarker = new google.maps.Marker({
      position: { lat: points[0].latitude, lng: points[0].longitude },
      map,
      title: 'Inicio',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: 10
    });

    const lastPoint = points[points.length - 1];
    this.routeEndMarker = new google.maps.Marker({
      position: { lat: lastPoint.latitude, lng: lastPoint.longitude },
      map,
      title: 'Fin',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#F44336',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: 10
    });

    const first = points[0];
    this.updateVehicleMarker(map, first.latitude, first.longitude, 0, first.speedKph > 0 ? 'moving' : 'stopped');

    const bounds = new google.maps.LatLngBounds();
    points.forEach(p => bounds.extend({ lat: p.latitude, lng: p.longitude }));
    map.fitBounds(bounds, 60);
  }

  /**
   * Renderiza la ruta como segmentos de polilínea coloreados por velocidad
   */
  private renderSpeedColoredSegments(
    map: google.maps.Map,
    points: RoutePlaybackPoint[]
  ): void {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];

      // Usar la velocidad promedio del segmento para determinar el color
      const avgSpeed = (from.speedKph + to.speedKph) / 2;
      const speedColor = getSpeedColor(avgSpeed);
      const hexColor = getSpeedHexColor(speedColor);

      const segment = new google.maps.Polyline({
        path: [
          { lat: from.latitude, lng: from.longitude },
          { lat: to.latitude, lng: to.longitude }
        ],
        geodesic: true,
        strokeColor: hexColor,
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map
      });

      this.routeSegments.push(segment);
    }
  }

  /**
   * Renderiza marcadores de paradas en el mapa
   */
  private renderStopMarkers(map: google.maps.Map, stops: VehicleStop[]): void {
    stops.forEach((stop, index) => {
      const marker = new google.maps.Marker({
        position: { lat: stop.latitude, lng: stop.longitude },
        map,
        title: `Parada #${index + 1}: ${stop.durationMinutes} min`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF9800', // Naranja para paradas
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        zIndex: 15
      });

      // Info window con detalles de la parada
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: sans-serif;">
            <strong>Parada #${index + 1}</strong><br>
            <span style="color: #666;">Duración: ${stop.durationMinutes} minutos</span><br>
            <span style="color: #666; font-size: 12px;">
              ${new Date(stop.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} -
              ${new Date(stop.endTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      this.stopMarkers.push(marker);
    });
  }

  private getMetersPerPixel(zoom: number, latitude: number): number {
    return (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  }

  private getDistanceThresholdByZoom(zoom: number): number {
    if (zoom <= 12) return 2000;
    if (zoom <= 14) return 1000;
    if (zoom <= 15) return 500;
    return 200;
  }

  private renderSpeedMarkers(map: google.maps.Map, points: RoutePlaybackPoint[]): void {
    this.speedMarkers.forEach(m => m.setMap(null));
    this.speedMarkers = [];

    if (points.length === 0) return;

    const zoom = map.getZoom() ?? 15;
    const baseThreshold = this.getDistanceThresholdByZoom(zoom);
    const metersPerPixel = this.getMetersPerPixel(zoom, points[0].latitude);
    const minDistanceMeters = metersPerPixel * 40;
    const threshold = Math.max(baseThreshold, minDistanceMeters);
    const SPEED_JUMP_THRESHOLD = 15;

    let accumulatedDistance = 0;
    let segmentPoints: RoutePlaybackPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      const lastPoint = segmentPoints.length > 0 ? segmentPoints[segmentPoints.length - 1] : null;
      const speedJump = lastPoint ? Math.abs(points[i].speedKph - lastPoint.speedKph) : 0;
      const hasSpeedJump = speedJump > SPEED_JUMP_THRESHOLD;

      if (hasSpeedJump && segmentPoints.length > 0) {
        const midIndex = Math.floor(segmentPoints.length / 2);
        const midPoint = segmentPoints[midIndex];
        const avgSpeed = segmentPoints.reduce((sum, p) => sum + p.speedKph, 0) / segmentPoints.length;
        const midPointSpeed = midPoint.speedKph;

        const marker = new google.maps.Marker({
          map,
          position: { lat: midPoint.latitude, lng: midPoint.longitude },
          icon: createSpeedBadgeIcon(avgSpeed, getSpeedHexColor(getSpeedColor(midPointSpeed))),
          title: `Velocidad promedio: ${Math.round(avgSpeed)} km/h`,
          zIndex: 10,
        });
        this.speedMarkers.push(marker);

        accumulatedDistance = 0;
        segmentPoints = [];
      }

      segmentPoints.push(points[i]);

      if (i > 0) {
        const dist = this.haversineDistance(points[i - 1], points[i]);
        accumulatedDistance += dist;
      }

      if (accumulatedDistance >= threshold || i === points.length - 1) {
        const midIndex = Math.floor(segmentPoints.length / 2);
        const midPoint = segmentPoints[midIndex];
        const avgSpeed = segmentPoints.reduce((sum, p) => sum + p.speedKph, 0) / segmentPoints.length;
        const midPointSpeed = midPoint.speedKph;

        const marker = new google.maps.Marker({
          map,
          position: { lat: midPoint.latitude, lng: midPoint.longitude },
          icon: createSpeedBadgeIcon(avgSpeed, getSpeedHexColor(getSpeedColor(midPointSpeed))),
          title: `Velocidad promedio: ${Math.round(avgSpeed)} km/h`,
          zIndex: 10,
        });
        this.speedMarkers.push(marker);

        accumulatedDistance = 0;
        segmentPoints = [];
      }
    }
  }

  private haversineDistance(
    a: Pick<RoutePlaybackPoint, 'latitude' | 'longitude'>,
    b: Pick<RoutePlaybackPoint, 'latitude' | 'longitude'>
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const sinDLat2 = Math.sin(dLat / 2);
    const sinDLng2 = Math.sin(dLng / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(sinDLat2 * sinDLat2 + Math.cos(lat1) * Math.cos(lat2) * sinDLng2 * sinDLng2),
        Math.sqrt(1 - (sinDLat2 * sinDLat2 + Math.cos(lat1) * Math.cos(lat2) * sinDLng2 * sinDLng2))
      );

    return R * c;
  }

  updateVehicleMarker(map: google.maps.Map, lat: number, lng: number, heading: number, status: string): void {
    const position = { lat, lng };
    const icon = createVehicleMarkerIcon(heading, status);

    if (this.routeVehicleMarker) {
      this.routeVehicleMarker.setPosition(position);
      this.routeVehicleMarker.setIcon(icon);
    } else {
      this.routeVehicleMarker = new google.maps.Marker({
        position,
        map,
        title: 'Posición',
        icon,
        zIndex: 20,
        optimized: false
      });
    }
  }

  clearRouteOverlays(): void {
    // Limpiar segmentos de ruta
    this.routeSegments.forEach(segment => segment.setMap(null));
    this.routeSegments = [];

    // Limpiar marcadores de paradas
    this.stopMarkers.forEach(marker => marker.setMap(null));
    this.stopMarkers = [];

    this.speedMarkers.forEach(m => m.setMap(null));
    this.speedMarkers = [];

    this.routeStartMarker?.setMap(null);
    this.routeStartMarker = null;
    this.routeEndMarker?.setMap(null);
    this.routeEndMarker = null;
    this.routeVehicleMarker?.setMap(null);
    this.routeVehicleMarker = null;

    // Limpiar listener de zoom y timer
    if (this.zoomListener) {
      google.maps.event.removeListener(this.zoomListener);
      this.zoomListener = null;
    }
    if (this.zoomDebounceTimer) {
      clearTimeout(this.zoomDebounceTimer);
      this.zoomDebounceTimer = null;
    }
    this.lastRenderedPoints = [];
  }
}
