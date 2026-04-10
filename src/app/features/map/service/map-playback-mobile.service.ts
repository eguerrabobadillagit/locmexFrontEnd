import { Injectable, signal, computed, inject } from '@angular/core';
import { RoutePlaybackService } from './route-playback.service';
import { FormattedHistoryPoint, PlaybackSpeed } from '../../vehicles/interfaces/vehicle-history.interface';
import { formatHistoryTime } from '../../vehicles/utils/vehicle-history.utils';

@Injectable({
  providedIn: 'root'
})
export class MapPlaybackMobileService {
  private readonly routePlayback = inject(RoutePlaybackService);

  playbackSpeed = signal<PlaybackSpeed>(1);
  sheetExpanded = signal<boolean>(false);

  mobilePlaybackPoints = computed<FormattedHistoryPoint[]>(() =>
    this.routePlayback.routePoints().map(p => ({
      index: p.index,
      time: formatHistoryTime(p.fixTimeUtc),
      location: `Lat: ${p.latitude.toFixed(4)}, Lng: ${p.longitude.toFixed(4)}`,
      speedKph: p.speedKph,
      latitude: p.latitude,
      longitude: p.longitude,
      status: p.speedKph > 0 ? 'moving' : 'stopped' as 'moving' | 'stopped'
    }))
  );

  mobileCurrentPointIndex = computed(() => {
    const p = this.routePlayback.currentPoint();
    return p ? p.index : 0;
  });

  isPlaybackPlaying = computed(() => this.routePlayback.isPlaying());

  togglePlayback(): void {
    if (this.routePlayback.isPlaying()) {
      this.routePlayback.pause();
    } else {
      this.routePlayback.play(this.playbackSpeed());
    }
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.playbackSpeed.set(speed);
    this.routePlayback.setSpeed(speed);
  }

  goToFirst(): void {
    this.routePlayback.seekTo(0);
  }

  goToPrevious(): void {
    this.routePlayback.seekTo(this.routePlayback.currentPointIndex - 1);
  }

  goToNext(): void {
    this.routePlayback.seekTo(this.routePlayback.currentPointIndex + 1);
  }

  goToLast(): void {
    this.routePlayback.seekTo(this.routePlayback.totalPoints - 1);
  }

  onSliderChange(event: CustomEvent): void {
    this.routePlayback.seekTo(event.detail.value as number);
  }

  toggleSheet(): void {
    this.sheetExpanded.update(v => !v);
  }

  closeRoute(): void {
    this.sheetExpanded.set(false);
    this.routePlayback.clearRoute();
    this.routePlayback.openSidebar();
  }

  onPointClick(point: FormattedHistoryPoint): void {
    this.routePlayback.seekTo(point.index);
  }
}
