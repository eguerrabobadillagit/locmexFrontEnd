import { Component, input, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { AlertService } from '../../../alerts/services/alert.service';
import { Alert, AlertType, AlertSeverity } from '../../../alerts/interfaces/alert.interface';
import { getAlertConfig, getSeverityConfig } from '../../../alerts/constants/alert-constants';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  alertCircleOutline,
  notificationsOutline,
  notificationsOffOutline,
  timeOutline
} from 'ionicons/icons';

// Registrar iconos
addIcons({
  refreshOutline,
  alertCircleOutline,
  notificationsOutline,
  notificationsOffOutline,
  timeOutline
});

@Component({
  selector: 'app-vehicle-alerts',
  templateUrl: './vehicle-alerts.component.html',
  styleUrls: ['./vehicle-alerts.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class VehicleAlertsComponent {
  // Inputs
  vehicleId = input.required<string>();

  // Inyecciones
  private readonly alertService = inject(AlertService);

  // Signals PRIVADAS
  private readonly _alerts = signal<Alert[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Signals PÚBLICAS (readonly)
  readonly alerts = this._alerts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed
  readonly totalCount = computed(() => this._alerts().length);
  readonly unresolvedCount = computed(() => this._alerts().filter(a => !a.isRead).length);

  constructor() {
    // Cargar alertas cuando cambia el vehicleId
    effect(() => {
      const vId = this.vehicleId();
      if (vId) {
        this.loadAlerts(vId);
      }
    });
  }

  private loadAlerts(vehicleId: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    // Por ahora: cargar todas y filtrar localmente
    // TODO: Cuando exista el endpoint específico, cambiar a:
    // this.alertService.getAlertsByVehicle(vehicleId)
    this.alertService.getAlerts('all', 1, 100).subscribe({
      next: (response) => {
        const vehicleAlerts = response.items.filter(a => a.vehicleId === vehicleId);
        this._alerts.set(vehicleAlerts);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error al cargar las alertas');
        this._isLoading.set(false);
      }
    });
  }

  reloadAlerts(): void {
    const vId = this.vehicleId();
    if (vId) {
      this.loadAlerts(vId);
    }
  }

  markAsRead(alertId: string): void {
    this.alertService.markAsRead(alertId).subscribe({
      next: () => {
        this._alerts.update(alerts =>
          alerts.map(a => a.alertId === alertId ? { ...a, isRead: true } : a)
        );
      },
      error: (err) => {
        console.error('Error al marcar alerta como leída:', err);
      }
    });
  }

  /**
   * Obtiene la configuración completa de una alerta por su tipo
   */
  getAlertConfig(type: AlertType | undefined) {
    return getAlertConfig(type);
  }

  /**
   * Obtiene la configuración de severidad
   */
  getSeverityConfig(severity: AlertSeverity) {
    return getSeverityConfig(severity);
  }

  /**
   * Calcula el tiempo relativo (ej: "2m", "1h", "ayer")
   */
  getRelativeTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  /**
   * Obtiene la hora exacta formateada
   */
  getExactTime(createdAt: string): string {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
}
