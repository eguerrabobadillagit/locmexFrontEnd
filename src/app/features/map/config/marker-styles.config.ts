/**
 * Configuración de colores y estilos para los marcadores de vehículos en el mapa
 */

export interface MarkerColors {
  stroke: string;
  fill: string;
  filterId: string;
}

/**
 * Mapeo de estados de vehículos a sus colores correspondientes
 */
export const VEHICLE_STATUS_COLORS: Record<string, MarkerColors> = {
  // Vehículo en movimiento
  IN_ROUTE: {
    stroke: '#4CAF50',
    fill: '#4CAF50',
    filterId: 'shadowGreen'
  },
  MOVING: {
    stroke: '#4CAF50',
    fill: '#4CAF50',
    filterId: 'shadowGreen'
  },
  
  // Vehículo detenido
  STOPPED: {
    stroke: '#FF9800',
    fill: '#FF9800',
    filterId: 'shadowOrange'
  },
  IDLE: {
    stroke: '#FF9800',
    fill: '#FF9800',
    filterId: 'shadowOrange'
  },
  
  // Vehículo sin señal
  NO_SIGNAL: {
    stroke: '#F44336',
    fill: '#F44336',
    filterId: 'shadowRed'
  },
  OFFLINE: {
    stroke: '#F44336',
    fill: '#F44336',
    filterId: 'shadowRed'
  },
  
  // Estado por defecto
  DEFAULT: {
    stroke: '#9E9E9E',
    fill: '#9E9E9E',
    filterId: 'shadowGray'
  }
};
