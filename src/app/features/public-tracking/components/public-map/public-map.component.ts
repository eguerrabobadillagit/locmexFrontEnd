import { Component, OnInit, ViewChild, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { layersOutline, mapOutline, globeOutline, earthOutline, locateOutline } from 'ionicons/icons';
import { PublicVehicleData } from '../../services/public-tracking.service';

// Función para crear icono del marcador (reutilizada del mapa principal)
function createVehicleMarkerIcon(heading: number, status: string): google.maps.Icon {
  const color = status === 'moving' ? '#4CAF50' : status === 'stopped' ? '#FF9800' : '#F44336';
  
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${heading} 20 20)">
        <path d="M20 5 L30 30 L20 25 L10 30 Z" fill="${color}" stroke="white" stroke-width="2"/>
      </g>
    </svg>
  `;
  
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20)
  };
}

@Component({
  selector: 'app-public-map',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker, IonFab, IonFabButton, IonFabList, IonIcon],
  templateUrl: './public-map.component.html',
  styleUrls: ['./public-map.component.scss']
})
export class PublicMapComponent implements OnInit {
  // Input para datos del vehículo
  vehicleData = input.required<PublicVehicleData | null>();
  
  // ViewChild para acceder al mapa
  @ViewChild(GoogleMap) googleMap!: GoogleMap;

  // Opciones del mapa
  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    zoom: 15,
    center: { lat: 0, lng: 0 }
  };

  // Tipo de mapa actual
  currentMapType: google.maps.MapTypeId = google.maps.MapTypeId.ROADMAP;

  // Computed para el marcador
  marker = computed(() => {
    const vehicle = this.vehicleData();
    if (!vehicle) return null;

    return {
      position: { lat: vehicle.latitude, lng: vehicle.longitude },
      title: vehicle.plate,
      icon: createVehicleMarkerIcon(vehicle.heading, vehicle.status)
    };
  });

  constructor() {
    addIcons({ layersOutline, mapOutline, globeOutline, earthOutline, locateOutline });
  }

  ngOnInit(): void {
    // Centrar el mapa en el vehículo cuando se cargan los datos
    const vehicle = this.vehicleData();
    if (vehicle) {
      this.mapOptions.center = { lat: vehicle.latitude, lng: vehicle.longitude };
    }
  }

  /**
   * Cambia el tipo de mapa
   */
  changeMapType(mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'): void {
    if (this.googleMap?.googleMap) {
      this.googleMap.googleMap.setMapTypeId(mapType);
      this.currentMapType = mapType as google.maps.MapTypeId;
    }
  }

  /**
   * Centra el mapa en el vehículo
   */
  centerOnVehicle(): void {
    const vehicle = this.vehicleData();
    if (vehicle && this.googleMap?.googleMap) {
      this.googleMap.googleMap.panTo({ lat: vehicle.latitude, lng: vehicle.longitude });
      this.googleMap.googleMap.setZoom(15);
    }
  }
}
