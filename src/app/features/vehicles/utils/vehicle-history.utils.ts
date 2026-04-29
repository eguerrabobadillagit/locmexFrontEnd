import { VehicleHistoryPoint } from '../interfaces/vehicle-history.interface';

export type SpeedColor = 'red' | 'yellow' | 'green' | 'gray';

export interface HistorySummary {
  totalDistance: string;
  totalDuration: string;
}

/** Umbral de velocidad para colorear la ruta:
 * - Verde: 0-40 km/h (velocidad normal/baja)
 * - Amarillo: 41-80 km/h (velocidad media)
 * - Rojo: >80 km/h (velocidad alta)
 */
const SPEED_COLOR_THRESHOLDS: { max: number; color: SpeedColor; label: string }[] = [
  { max: 0,          color: 'gray',   label: 'Detenido' },
  { max: 40,         color: 'green',  label: 'Baja' },
  { max: 80,         color: 'yellow', label: 'Media' },
  { max: Infinity,   color: 'red',    label: 'Alta' },
];

export function getSpeedColor(speedKph: number): SpeedColor {
  return (
    SPEED_COLOR_THRESHOLDS.find(t => speedKph <= t.max)?.color ?? 'red'
  );
}

export function getSpeedColorLabel(speedKph: number): string {
  return (
    SPEED_COLOR_THRESHOLDS.find(t => speedKph <= t.max)?.label ?? 'Alta'
  );
}

/** Obtiene el color hexadecimal para un color de velocidad */
export function getSpeedHexColor(speedColor: SpeedColor): string {
  switch (speedColor) {
    case 'red': return '#F44336';
    case 'yellow': return '#FFC107';
    case 'green': return '#4CAF50';
    case 'gray': return '#9E9E9E';
    default: return '#4CAF50';
  }
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

/** Representa una parada detectada en el recorrido */
export interface VehicleStop {
  startIndex: number;
  endIndex: number;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  durationMinutes: number;
}

/** Tipo mínimo necesario para detectar paradas */
export interface StopDetectionPoint {
  fixTimeUtc: string;
  latitude: number;
  longitude: number;
  speedKph: number;
}

/**
 * Detecta puntos donde hay cambios significativos de velocidad.
 * Útil para colocar marcadores de velocidad en el mapa.
 * @param points - Puntos del historial
 * @param speedChangeThreshold - Umbral mínimo de cambio de velocidad en km/h (default: 10)
 * @param minSpeedForMarker - Velocidad mínima para mostrar marcador (default: 5) - evita marcadores en paradas cortas
 * @returns Índices de los puntos donde hay cambios significativos de velocidad
 */
export function detectSpeedChangePoints<T extends { speedKph: number; heading: number | null }>(
  points: T[],
  speedChangeThreshold: number = 10,
  minSpeedForMarker: number = 5
): number[] {
  if (points.length < 2) return [];

  const changeIndices: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const speedDiff = Math.abs(curr.speedKph - prev.speedKph);

    // Detectar cambio significativo de velocidad
    const isSignificantChange = speedDiff >= speedChangeThreshold;
    // Detectar inicio de movimiento después de estar detenido
    const isStartMoving = prev.speedKph === 0 && curr.speedKph >= minSpeedForMarker;
    // Detectar fin de movimiento (inicio de parada)
    const isStopMoving = prev.speedKph >= minSpeedForMarker && curr.speedKph === 0;

    if (isSignificantChange || isStartMoving || isStopMoving) {
      // Para inicio de movimiento, usar el punto actual; para detención, usar el punto anterior
      if (isStopMoving) {
        if (!changeIndices.includes(i - 1)) {
          changeIndices.push(i - 1);
        }
      } else {
        if (!changeIndices.includes(i)) {
          changeIndices.push(i);
        }
      }
    }
  }

  return changeIndices;
}

/**
 * Detecta paradas en el historial del vehículo.
 * Una parada es una secuencia consecutiva de puntos donde speedKph = 0.
 * @param points - Puntos del historial
 * @param minDurationMinutes - Duración mínima para considerar una parada (default: 2 minutos)
 * @returns Lista de paradas detectadas
 */
export function detectStops(
  points: StopDetectionPoint[],
  minDurationMinutes: number = 2
): VehicleStop[] {
  if (points.length < 2) return [];

  const stops: VehicleStop[] = [];
  let stopStartIndex: number | null = null;

  for (let i = 0; i < points.length; i++) {
    const isStopped = points[i].speedKph === 0;

    if (isStopped && stopStartIndex === null) {
      // Inicio de una parada
      stopStartIndex = i;
    } else if (!isStopped && stopStartIndex !== null) {
      // Fin de una parada
      const startTime = new Date(points[stopStartIndex].fixTimeUtc).getTime();
      const endTime = new Date(points[i - 1].fixTimeUtc).getTime();
      const durationMinutes = (endTime - startTime) / (1000 * 60);

      if (durationMinutes >= minDurationMinutes) {
        stops.push({
          startIndex: stopStartIndex,
          endIndex: i - 1,
          startTime: points[stopStartIndex].fixTimeUtc,
          endTime: points[i - 1].fixTimeUtc,
          latitude: points[stopStartIndex].latitude,
          longitude: points[stopStartIndex].longitude,
          durationMinutes: Math.round(durationMinutes)
        });
      }
      stopStartIndex = null;
    }
  }

  // Manejar parada al final del recorrido
  if (stopStartIndex !== null) {
    const startTime = new Date(points[stopStartIndex].fixTimeUtc).getTime();
    const endTime = new Date(points[points.length - 1].fixTimeUtc).getTime();
    const durationMinutes = (endTime - startTime) / (1000 * 60);

    if (durationMinutes >= minDurationMinutes) {
      stops.push({
        startIndex: stopStartIndex,
        endIndex: points.length - 1,
        startTime: points[stopStartIndex].fixTimeUtc,
        endTime: points[points.length - 1].fixTimeUtc,
        latitude: points[stopStartIndex].latitude,
        longitude: points[stopStartIndex].longitude,
        durationMinutes: Math.round(durationMinutes)
      });
    }
  }

  return stops;
}
