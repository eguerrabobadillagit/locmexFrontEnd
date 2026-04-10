import { Injectable, signal } from '@angular/core';
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

  readonly routePoints = this._routePoints.asReadonly();
  readonly currentPoint = this._currentPoint.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();

  private playbackInterval: number | null = null;
  private currentIndex = 0;
  private speedMultiplier = 1;

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
    this._routePoints.set(mapped);
    this._currentPoint.set(mapped[0] ?? null);
  }

  clearRoute(): void {
    this.stop();
    this._routePoints.set([]);
    this._currentPoint.set(null);
  }

  play(speedMultiplier: number = 1): void {
    this.speedMultiplier = speedMultiplier;
    const points = this._routePoints();
    if (points.length === 0) return;

    this._isPlaying.set(true);
    const intervalMs = Math.max(100, 500 / this.speedMultiplier);

    this.playbackInterval = setInterval(() => {
      const pts = this._routePoints();
      if (this.currentIndex >= pts.length - 1) {
        this.stop();
        return;
      }
      this.currentIndex++;
      this._currentPoint.set(pts[this.currentIndex]);
    }, intervalMs) as unknown as number;
  }

  pause(): void {
    this._isPlaying.set(false);
    if (this.playbackInterval !== null) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  stop(): void {
    this.pause();
    this.currentIndex = 0;
    const pts = this._routePoints();
    if (pts.length > 0) {
      this._currentPoint.set(pts[0]);
    }
  }

  seekTo(index: number): void {
    const points = this._routePoints();
    const clamped = Math.max(0, Math.min(index, points.length - 1));
    this.currentIndex = clamped;
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
}
