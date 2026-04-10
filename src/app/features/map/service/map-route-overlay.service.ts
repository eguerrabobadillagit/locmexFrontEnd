import { Injectable } from '@angular/core';
import { RoutePlaybackPoint } from '../interfaces/route-playback-point.interface';
import { createVehicleMarkerIcon } from '../utils/vehicle-marker-icon.util';

@Injectable({
  providedIn: 'root'
})
export class MapRouteOverlayService {
  private routePolyline: google.maps.Polyline | null = null;
  private routeStartMarker: google.maps.Marker | null = null;
  private routeEndMarker: google.maps.Marker | null = null;
  private routeVehicleMarker: google.maps.Marker | null = null;

  renderRoutePolyline(
    map: google.maps.Map,
    points: Pick<RoutePlaybackPoint, 'latitude' | 'longitude' | 'speedKph'>[]
  ): void {
    this.clearRouteOverlays();

    const path = points.map(p => ({ lat: p.latitude, lng: p.longitude }));

    this.routePolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1E88E5',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map
    });

    this.routeStartMarker = new google.maps.Marker({
      position: path[0],
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

    this.routeEndMarker = new google.maps.Marker({
      position: path[path.length - 1],
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
    path.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 60);
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
    this.routePolyline?.setMap(null);
    this.routePolyline = null;
    this.routeStartMarker?.setMap(null);
    this.routeStartMarker = null;
    this.routeEndMarker?.setMap(null);
    this.routeEndMarker = null;
    this.routeVehicleMarker?.setMap(null);
    this.routeVehicleMarker = null;
  }
}
