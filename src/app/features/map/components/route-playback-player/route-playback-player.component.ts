import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonRange } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playOutline,
  pauseOutline,
  playBackOutline,
  playForwardOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  speedometerOutline
} from 'ionicons/icons';
import { FormattedHistoryPoint, PlaybackSpeed } from '../../../vehicles/interfaces/vehicle-history.interface';

@Component({
  selector: 'app-route-playback-player',
  templateUrl: './route-playback-player.component.html',
  styleUrls: ['./route-playback-player.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonRange]
})
export class RoutePlaybackPlayerComponent {
  formattedPoints = input.required<FormattedHistoryPoint[]>();
  currentPointIndex = input.required<number>();
  isPlaying = input.required<boolean>();
  playbackSpeed = input.required<PlaybackSpeed>();

  speedChange = output<PlaybackSpeed>();
  sliderChange = output<CustomEvent>();
  goToFirst = output<void>();
  goToPrevious = output<void>();
  goToNext = output<void>();
  goToLast = output<void>();
  togglePlayback = output<void>();

  readonly speedOptions: PlaybackSpeed[] = [0.5, 1, 2, 4];

  constructor() {
    addIcons({
      playOutline,
      pauseOutline,
      playBackOutline,
      playForwardOutline,
      playSkipBackOutline,
      playSkipForwardOutline,
      speedometerOutline
    });
  }

  onSliderChange(event: CustomEvent) {
    this.sliderChange.emit(event);
  }
}
