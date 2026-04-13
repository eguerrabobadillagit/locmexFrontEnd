import { Injectable } from '@angular/core';

export interface GeocodingResult {
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private geocoder: google.maps.Geocoder | null = null;
  private cache = new Map<string, GeocodingResult>();

  constructor() {
    this.initializeGeocoder();
  }

  private initializeGeocoder(): void {
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      this.geocoder = new google.maps.Geocoder();
    } else {
      setTimeout(() => this.initializeGeocoder(), 500);
    }
  }

  async getAddressFromCoordinates(lat: number, lng: number): Promise<GeocodingResult | null> {
    // Validar coordenadas
    if (lat === 0 && lng === 0) {
      return null;
    }

    // Verificar cache
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Esperar a que el geocoder esté disponible
    let attempts = 0;
    while (!this.geocoder && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.geocoder) {
      return null;
    }

    try {
      const response = await this.geocoder.geocode({
        location: { lat, lng },
        language: 'es'
      });

      if (response.results && response.results.length > 0) {
        const result = this.parseGeocodingResult(response.results[0]);
        this.cache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private parseGeocodingResult(result: any): GeocodingResult {
    const components = result.address_components || [];
    
    const street = this.getComponent(components, 'route');
    const streetNumber = this.getComponent(components, 'street_number');
    const city = this.getComponent(components, 'locality') || 
                 this.getComponent(components, 'administrative_area_level_2');
    const state = this.getComponent(components, 'administrative_area_level_1');
    const country = this.getComponent(components, 'country');
    const postalCode = this.getComponent(components, 'postal_code');

    return {
      formattedAddress: result.formatted_address,
      street: streetNumber ? `${street} ${streetNumber}` : street,
      city,
      state,
      country,
      postalCode
    };
  }

  private getComponent(
    components: any[],
    type: string
  ): string | undefined {
    const component = components.find((c: any) => c.types.includes(type));
    return component?.long_name;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
