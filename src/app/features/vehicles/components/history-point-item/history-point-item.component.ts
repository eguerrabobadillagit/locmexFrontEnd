import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
import { FormattedHistoryPoint } from '../../interfaces/vehicle-history.interface';
import { getSpeedColor, getStatusLabel } from '../../utils/vehicle-history.utils';

@Component({
  selector: 'app-history-point-item',
  templateUrl: './history-point-item.component.html',
  styleUrls: ['./history-point-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class HistoryPointItemComponent {
  @Input() point!: FormattedHistoryPoint;
  @Input() isActive = false;

  constructor() {
    addIcons({ locationOutline });
  }

  get speedColorClass(): string {
    return 'speed-' + getSpeedColor(this.point.speedKph);
  }

  get statusLabel(): string {
    return getStatusLabel(this.point.status);
  }
}
