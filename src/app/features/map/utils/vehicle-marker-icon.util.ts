import { VEHICLE_STATUS_COLORS, MarkerColors } from '../config/marker-styles.config';
import { getSpeedColor, getSpeedHexColor } from '../../vehicles/utils/vehicle-history.utils';

/**
 * Obtiene los colores correspondientes al estado de un vehículo
 * @param status Estado del vehículo (In_route, stopped, offline, etc.)
 * @returns Objeto con los colores stroke, fill y filterId
 */
export function getColorByVehicleStatus(status: string): MarkerColors {
  const normalizedStatus = status.toUpperCase().replace('-', '_');
  return VEHICLE_STATUS_COLORS[normalizedStatus] || VEHICLE_STATUS_COLORS['DEFAULT'];
}

/**
 * Crea un icono SVG rotado para un marcador de vehículo en Google Maps
 * @param heading Dirección del vehículo en grados (0-360)
 * @param status Estado del vehículo
 * @returns Objeto google.maps.Icon con el SVG del marcador
 */
export function createVehicleMarkerIcon(heading: number, status: string): google.maps.Icon {
  const colors = getColorByVehicleStatus(status);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <filter id="${colors.filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <g transform="rotate(${heading} 32 32)" filter="url(#${colors.filterId})">
        <circle cx="32" cy="32" r="28" fill="#ffffff" stroke="${colors.stroke}" stroke-width="4"/>
        <path d="M20 18 L46 32 L20 46 L26 32 Z" fill="${colors.fill}"/>
      </g>
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(44, 44),
    anchor: new google.maps.Point(22, 22)
  };
}

export function createSpeedBadgeIcon(speedKph: number, overrideColor?: string): google.maps.Icon {
  const color = overrideColor ?? getSpeedHexColor(getSpeedColor(speedKph));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="9" font-family="Arial, sans-serif" font-weight="bold" fill="#333">${Math.round(speedKph)}</text></svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };
}
