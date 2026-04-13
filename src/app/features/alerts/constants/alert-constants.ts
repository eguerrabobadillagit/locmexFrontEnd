import { AlertType, AlertSeverity } from '../interfaces/alert.interface';

export interface AlertConfig {
  icon: string;
  label: string;
  backgroundColor: string;
  textColor: string;
}

export const ALERT_TYPE_CONFIG: Record<AlertType, AlertConfig> = {
  'geofence_exit': {
    icon: 'location-outline',
    label: 'SALIDA GEOCERCA',
    backgroundColor: '#FEE2E266',
    textColor: '#DC2626'
  },
  'geofence_enter': {
    icon: 'location-outline',
    label: 'ENTRADA GEOCERCA',
    backgroundColor: '#DBEAFE66',
    textColor: '#2563EB'
  },
  'speeding': {
    icon: 'speedometer-outline',
    label: 'EXCESO DE VELOCIDAD',
    backgroundColor: '#FEF3C766',
    textColor: '#D97706'
  },
  'low_battery': {
    icon: 'battery-dead-outline',
    label: 'BATERÍA BAJA',
    backgroundColor: '#FEF3C766',
    textColor: '#D97706'
  },
  'panic': {
    icon: 'warning-outline',
    label: 'PÁNICO',
    backgroundColor: '#FEE2E266',
    textColor: '#DC2626'
  },
  'ignition': {
    icon: 'power-outline',
    label: 'ENCENDIDO/APAGADO',
    backgroundColor: '#F3F4F666',
    textColor: '#6B7280'
  },
  'maintenance': {
    icon: 'construct-outline',
    label: 'MANTENIMIENTO',
    backgroundColor: '#F3F4F666',
    textColor: '#6B7280'
  },
  'towing': {
    icon: 'car-outline',
    label: 'REMOLQUE',
    backgroundColor: '#FEE2E266',
    textColor: '#DC2626'
  },
  'device_offline': {
    icon: 'wifi-outline',
    label: 'DISPOSITIVO OFFLINE',
    backgroundColor: '#FEE2E266',
    textColor: '#DC2626'
  },
  'device_online': {
    icon: 'wifi-outline',
    label: 'DISPOSITIVO ONLINE',
    backgroundColor: '#DBEAFE66',
    textColor: '#2563EB'
  },
  'fuel_level': {
    icon: 'water-outline',
    label: 'NIVEL DE COMBUSTIBLE',
    backgroundColor: '#FEF3C766',
    textColor: '#D97706'
  },
  'temperature': {
    icon: 'thermometer-outline',
    label: 'TEMPERATURA',
    backgroundColor: '#FEF3C766',
    textColor: '#D97706'
  },
  'geofence': {
    icon: 'location-outline',
    label: 'GEOCERCA',
    backgroundColor: '#DBEAFE66',
    textColor: '#2563EB'
  },
  'unknown': {
    icon: 'notifications-outline',
    label: 'ALERTA',
    backgroundColor: '#FFFFFF',
    textColor: '#6B7280'
  }
};

// Configuración por severidad
export const SEVERITY_CONFIG: Record<string, { icon: string; color: string }> = {
  'warning': { icon: 'alert-circle-outline', color: '#F59E0B' },
  'info': { icon: 'information-circle-outline', color: '#3B82F6' },
  'error': { icon: 'close-circle-outline', color: '#EF4444' }
};

// Helper functions
export function getAlertConfig(type: AlertType | undefined): AlertConfig {
  if (!type) return ALERT_TYPE_CONFIG['unknown'];
  return ALERT_TYPE_CONFIG[type] || ALERT_TYPE_CONFIG['unknown'];
}

export function getSeverityConfig(severity: string): { icon: string; color: string } {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG['info'];
}
