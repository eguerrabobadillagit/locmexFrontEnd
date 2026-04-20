import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOffOutline, notificationsOutline, closeOutline, timeOutline, alertCircleOutline, informationCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { getAlertConfig, getSeverityConfig } from '../../../alerts/constants/alert-constants';
import { AlertType, AlertSeverity } from '../../../alerts/interfaces/alert.interface';

export interface AlertView {
  id: string;
  alertId: string;
  vehicleName: string;
  message: string;
  alertType: AlertType;
  severity: AlertSeverity;
  createdAtUtc: string;
  read: boolean;
}

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner, IonButton]
})
export class AlertsListComponent {
  alerts = input<AlertView[]>([]);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  totalCount = input<number>(0);
  unreadCount = input<number>(0);

  alertClick = output<string>();
  close = output<void>();

  // Signal para controlar si mostrar todas o solo las primeras 3
  showAll = signal<boolean>(false);

  // Alerts a mostrar (3 o todas)
  displayedAlerts = computed(() => {
    const all = this.alerts();
    if (this.showAll()) {
      return all;
    }
    return all.slice(0, 3);
  });

  // Si hay más alertas de las que se muestran
  hasMoreAlerts = computed(() => this.alerts().length > 3);

  constructor() {
    addIcons({ notificationsOffOutline, notificationsOutline, closeOutline, timeOutline, alertCircleOutline, informationCircleOutline, closeCircleOutline });
  }

  onAlertClick(alertId: string): void {
    this.alertClick.emit(alertId);
  }

  onClose(): void {
    this.close.emit();
  }

  toggleShowAll(): void {
    this.showAll.update(v => !v);
  }

  getAlertConfig = getAlertConfig;
  getSeverityConfig = getSeverityConfig;

  getRelativeTime(createdAtUtc: string): string {
    const date = new Date(createdAtUtc);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return date.toLocaleDateString();
  }

  getExactTime(createdAtUtc: string): string {
    const date = new Date(createdAtUtc);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
}
