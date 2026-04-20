import { Injectable, signal, computed } from '@angular/core';
import { VehicleHistoryPoint } from '../../vehicles/interfaces/vehicle-history.interface';
import { RoutePlaybackPoint } from '../interfaces/route-playback-point.interface';

export { RoutePlaybackPoint };

@Injectable({
  providedIn: 'root'
})
export class RoutePlaybackService {
  private readonly _routePoints = signal<RoutePlaybackPoint[]>([]);
  private readonly _currentPoint = signal<RoutePlaybackPoint | null>(null);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _requestSidebarOpen = signal<boolean>(false);
  private readonly _isLoadingRoute = signal<boolean>(false);

  readonly routePoints = this._routePoints.asReadonly();
  readonly currentPoint = this._currentPoint.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly requestSidebarOpen = this._requestSidebarOpen.asReadonly();
  readonly isLoadingRoute = this._isLoadingRoute.asReadonly();

  openSidebar(): void {
    this._requestSidebarOpen.set(true);
  }

  consumeSidebarRequest(): void {
    this._requestSidebarOpen.set(false);
  }

  setLoadingRoute(loading: boolean): void {
    console.log('[RoutePlaybackService] setLoadingRoute:', loading);
    this._isLoadingRoute.set(loading);
  }

  /** Timestamps reales (ms) de cada punto GPS */
  private pointTimestampsMs: number[] = [];
  /** Duración total del recorrido en ms reales */
  private totalDurationMs = 0;
  /** Tiempo simulado actual en ms (dentro del recorrido) */
  private simulatedTimeMs = 0;
  /** Índice del segmento actual (punto de origen del segmento) */
  private currentIndex = 0;
  private speedMultiplier = 1;

  private rafId: number | null = null;
  private lastRafTimestamp: number | null = null;
  private frameCallback: ((lat: number, lng: number, heading: number, status: string) => void) | null = null;

  loadRoute(points: VehicleHistoryPoint[]): void {
    const mapped: RoutePlaybackPoint[] = points.map((p, i) => ({
      index: i,
      latitude: p.latitude,
      longitude: p.longitude,
      speedKph: p.speedKph,
      heading: p.heading,
      fixTimeUtc: p.fixTimeUtc,
      status: p.speedKph > 0 ? 'moving' : 'stopped'
    }));

    this.stop();
    this.currentIndex = 0;
    this.simulatedTimeMs = 0;
    this._routePoints.set(mapped);
    this._currentPoint.set(mapped[0] ?? null);

    this.pointTimestampsMs = mapped.map(p => new Date(p.fixTimeUtc).getTime());
    this.totalDurationMs = this.pointTimestampsMs.length > 1
      ? this.pointTimestampsMs[this.pointTimestampsMs.length - 1] - this.pointTimestampsMs[0]
      : 0;
  }

  clearRoute(): void {
    this.stop();
    this._routePoints.set([]);
    this._currentPoint.set(null);
    this.pointTimestampsMs = [];
    this.totalDurationMs = 0;
    this.simulatedTimeMs = 0;
  }

  play(speedMultiplier: number = 1): void {
    this.speedMultiplier = speedMultiplier;
    const points = this._routePoints();
    if (points.length === 0) return;
    if (points.length === 1) {
      this._currentPoint.set(points[0]);
      return;
    }

    this._isPlaying.set(true);
    this.lastRafTimestamp = null;
    this.rafId = requestAnimationFrame(this.rafLoop);
  }

  pause(): void {
    this._isPlaying.set(false);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastRafTimestamp = null;
  }

  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.simulatedTimeMs = 0;
    const pts = this._routePoints();
    if (pts.length > 0) {
      this._currentPoint.set(pts[0]);
    }
  }

  seekTo(index: number): void {
    const points = this._routePoints();
    const clamped = Math.max(0, Math.min(index, points.length - 1));
    this.currentIndex = clamped;
    if (this.pointTimestampsMs.length > clamped) {
      this.simulatedTimeMs = this.pointTimestampsMs[clamped] - (this.pointTimestampsMs[0] ?? 0);
    }
    this._currentPoint.set(points[clamped] ?? null);
  }

  setSpeed(multiplier: number): void {
    const wasPlaying = this._isPlaying();
    if (wasPlaying) {
      this.pause();
      this.play(multiplier);
    } else {
      this.speedMultiplier = multiplier;
    }
  }

  get currentPointIndex(): number {
    return this.currentIndex;
  }

  get totalPoints(): number {
    return this._routePoints().length;
  }

  /** Registra un callback que se llama en cada frame del RAF loop con la posición interpolada */
  setFrameCallback(cb: ((lat: number, lng: number, heading: number, status: string) => void) | null): void {
    this.frameCallback = cb;
  }

  // ─── RAF loop ──────────────────────────────────────────────────────────────

  private readonly rafLoop = (nowMs: number): void => {
    if (!this._isPlaying()) return;

    if (this.lastRafTimestamp === null) {
      this.lastRafTimestamp = nowMs;
    }

    const wallDeltaMs = nowMs - this.lastRafTimestamp;
    this.lastRafTimestamp = nowMs;

    this.simulatedTimeMs += wallDeltaMs * this.speedMultiplier;

    if (this.simulatedTimeMs >= this.totalDurationMs) {
      const pts = this._routePoints();
      this._currentPoint.set(pts[pts.length - 1]);
      this.currentIndex = pts.length - 1;
      this.stop();
      return;
    }

    this.emitInterpolatedPoint();
    this.notifyFrameCallback();
    this.rafId = requestAnimationFrame(this.rafLoop);
  };

  private emitInterpolatedPoint(): void {
    const pts = this._routePoints();
    const timestamps = this.pointTimestampsMs;
    if (pts.length < 2 || timestamps.length < 2) return;

    const absoluteTimeMs = timestamps[0] + this.simulatedTimeMs;

    // Encontrar el segmento donde cae el tiempo actual
    let segIdx = this.currentIndex;
    while (segIdx < pts.length - 2 && timestamps[segIdx + 1] <= absoluteTimeMs) {
      segIdx++;
    }
    this.currentIndex = segIdx;

    const from = pts[segIdx];
    const to = pts[segIdx + 1];
    const segStartMs = timestamps[segIdx];
    const segEndMs = timestamps[segIdx + 1];
    const segDuration = segEndMs - segStartMs;

    const t = segDuration > 0
      ? Math.min(1, (absoluteTimeMs - segStartMs) / segDuration)
      : 1;

    const lat = from.latitude + (to.latitude - from.latitude) * t;
    const lng = from.longitude + (to.longitude - from.longitude) * t;
    const speedKph = from.speedKph + (to.speedKph - from.speedKph) * t;
    const heading = this.interpolateHeading(from.heading ?? 0, to.heading ?? 0, t);

    this._currentPoint.set({
      index: segIdx,
      latitude: lat,
      longitude: lng,
      speedKph,
      heading,
      fixTimeUtc: from.fixTimeUtc,
      status: speedKph > 0 ? 'moving' : 'stopped'
    });
  }

  private notifyFrameCallback(): void {
    if (!this.frameCallback) return;
    const p = this._currentPoint();
    if (p) {
      this.frameCallback(p.latitude, p.longitude, p.heading ?? 0, p.status);
    }
  }

  /** Interpolación de ángulo tomando el camino más corto (evita saltos de 359°→1°) */
  private interpolateHeading(fromDeg: number, toDeg: number, t: number): number {
    let delta = ((toDeg - fromDeg + 540) % 360) - 180;
    return (fromDeg + delta * t + 360) % 360;
  }
}
