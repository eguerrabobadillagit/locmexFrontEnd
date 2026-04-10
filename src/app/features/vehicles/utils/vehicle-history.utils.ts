import { VehicleHistoryPoint } from '../interfaces/vehicle-history.interface';

export type SpeedColor = 'gray' | 'orange' | 'green' | 'blue';

export interface HistorySummary {
  totalDistance: string;
  totalDuration: string;
}

const SPEED_COLOR_THRESHOLDS: { max: number; color: SpeedColor }[] = [
  { max: 0,          color: 'gray'   },
  { max: 19,         color: 'orange' },
  { max: 59,         color: 'green'  },
  { max: Infinity,   color: 'blue'   },
];

export function getSpeedColor(speedKph: number): SpeedColor {
  return (
    SPEED_COLOR_THRESHOLDS.find(t => speedKph <= t.max)?.color ?? 'blue'
  );
}

export function getStatusLabel(status: 'moving' | 'stopped'): string {
  return status === 'moving' ? 'En movimiento' : 'Detenido';
}

export function calculateDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateHistorySummary(points: VehicleHistoryPoint[]): HistorySummary {
  if (points.length === 0) {
    return { totalDistance: '0 km', totalDuration: '0h 0m' };
  }

  const firstTime = new Date(points[0].fixTimeUtc).getTime();
  const lastTime = new Date(points[points.length - 1].fixTimeUtc).getTime();
  const durationMs = lastTime - firstTime;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += calculateDistanceKm(
      points[i - 1].latitude, points[i - 1].longitude,
      points[i].latitude, points[i].longitude
    );
  }

  return {
    totalDistance: `${totalDist.toFixed(1)} km`,
    totalDuration: `${durationHours}h ${durationMinutes}m`
  };
}

export function formatHistoryTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
