import { Component, Input, Output, EventEmitter, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  arrowBackOutline,
  analyticsOutline,
  calendarOutline,
  locationOutline,
  searchOutline,
  trailSignOutline, carOutline, alertCircleOutline } from 'ionicons/icons';
import { VehicleHistoryService } from '../../services/vehicle-history.service';
import { HistoryPointItemComponent } from '../history-point-item/history-point-item.component';
import { RoutePlaybackPlayerComponent } from '../../../../features/map/components/route-playback-player/route-playback-player.component';
import { RoutePlaybackService } from '../../../../features/map/service/route-playback.service';
import {
  VehicleHistoryPoint,
  FormattedHistoryPoint,
  PlaybackSpeed
} from '../../interfaces/vehicle-history.interface';
import { calculateHistorySummary, formatHistoryTime } from '../../utils/vehicle-history.utils';

@Component({
  selector: 'app-vehicle-history-route',
  templateUrl: './vehicle-history-route.component.html',
  styleUrls: ['./vehicle-history-route.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonCard,
    IonCardContent,
    HistoryPointItemComponent,
    RoutePlaybackPlayerComponent
  ]
})
export class VehicleHistoryRouteComponent implements OnInit {
  @Input() vehicleId!: string;
  @Input() vehiclePlate!: string;
  @Input() fromDate!: string;
  @Input() fromHour!: string;
  @Input() fromMinute!: string;
  @Input() toDate!: string;
  @Input() toHour!: string;
  @Input() toMinute!: string;

  // Datos precargados (opcionales) - cuando se pasan, no se hace la llamada a la API
  @Input() historyPointsData: VehicleHistoryPoint[] | null = null;
  @Input() formattedPointsData: FormattedHistoryPoint[] | null = null;
  @Input() totalDistance: string = '0 km';
  @Input() totalDuration: string = '0h 0m';
  @Input() totalPoints: number = 0;

  @Output() closeRoute = new EventEmitter<void>();
  @Output() backToForm = new EventEmitter<void>();
  @Output() pointSelect = new EventEmitter<FormattedHistoryPoint>();

  private readonly historyService = inject(VehicleHistoryService);
  private readonly routePlayback = inject(RoutePlaybackService);

  // Results data
  historyPoints = signal<VehicleHistoryPoint[]>([]);
  formattedPoints = signal<FormattedHistoryPoint[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Playback
  isPlaying = signal<boolean>(false);
  playbackSpeed = signal<PlaybackSpeed>(1);
  currentPointIndex = signal<number>(0);
  _totalDistance = signal<string>('0 km');
  _totalDuration = signal<string>('0h 0m');
  _totalPoints = signal<number>(0);

  constructor() {
    console.log('[VehicleHistoryRoute] Constructor - Componente creado');
    addIcons({
      arrowBackOutline,
      analyticsOutline,
      closeOutline,
      carOutline,
      calendarOutline,
      searchOutline,
      alertCircleOutline,
      locationOutline,
      trailSignOutline,
    });

    effect(() => {
      this.isPlaying.set(this.routePlayback.isPlaying());
    });

    effect(() => {
      const point = this.routePlayback.currentPoint();
      if (point) {
        this.currentPointIndex.set(point.index);
      }
    });
  }

  ngOnInit() {
    console.log('[VehicleHistoryRoute] ngOnInit - Componente inicializado');

    // Si se pasaron datos precargados, usarlos directamente
    if (this.historyPointsData && this.historyPointsData.length > 0) {
      console.log('[VehicleHistoryRoute] Usando datos precargados:', this.historyPointsData.length, 'puntos');
      this.usePreloadedData();
    } else {
      // Si no hay datos precargados, cargar desde la API
      console.log('[VehicleHistoryRoute] No hay datos precargados, cargando desde API');
      this.loadHistoryData();
    }
  }

  // Getters para acceder a los valores (inputs o signals)
  get totalDistanceValue(): string {
    return this.totalDistance || this._totalDistance();
  }

  get totalDurationValue(): string {
    return this.totalDuration || this._totalDuration();
  }

  get totalPointsValue(): number {
    return this.totalPoints || this._totalPoints();
  }

  private usePreloadedData() {
    if (this.historyPointsData) {
      this.historyPoints.set(this.historyPointsData);
      this.routePlayback.loadRoute(this.historyPointsData);
    }
    if (this.formattedPointsData) {
      this.formattedPoints.set(this.formattedPointsData);
    }
    // Usar los totales pasados como inputs
    const summary = calculateHistorySummary(this.historyPoints());
    this._totalDistance.set(summary.totalDistance);
    this._totalDuration.set(summary.totalDuration);
    this._totalPoints.set(this.historyPoints().length);
  }

  private loadHistoryData() {
    console.log('[VehicleHistoryRoute] Iniciando carga de historial');
    this.isLoading.set(true);
    this.routePlayback.setLoadingRoute(true);
    this.error.set(null);

    const fromDateTime = `${this.fromDate}T${this.fromHour}:${this.fromMinute}:00`;
    const toDateTime = `${this.toDate}T${this.toHour}:${this.toMinute}:59`;
    const fromUtc = new Date(fromDateTime).toISOString();
    const toUtc = new Date(toDateTime).toISOString();

    this.historyService.getVehicleHistory({
      vehicleId: this.vehicleId,
      fromUtc,
      toUtc
    }).subscribe({
      next: (points) => {
        console.log('[VehicleHistoryRoute] Datos cargados exitosamente:', points.length, 'puntos');
        this.historyPoints.set(points);
        this.formattedPoints.set(this.formatHistoryPoints(points));
        this.calculateSummary(points);
        this._totalPoints.set(points.length);
        this.routePlayback.loadRoute(points);
        this.isLoading.set(false);
        this.routePlayback.setLoadingRoute(false);
      },
      error: (err) => {
        console.error('[VehicleHistoryRoute] Error al cargar historial:', err);
        let errorMessage = 'Error al cargar el historial. Por favor, intenta de nuevo.';
        if (err.error?.errors && Array.isArray(err.error.errors[''])) {
          errorMessage = err.error.errors[''][0];
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
        this.routePlayback.setLoadingRoute(false);
        console.log('[VehicleHistoryRoute] Carga finalizada con error');
      }
    });
  }

  private formatHistoryPoints(points: VehicleHistoryPoint[]): FormattedHistoryPoint[] {
    return points.map((point, index) => ({
      index,
      time: formatHistoryTime(point.fixTimeUtc),
      location: `Lat: ${point.latitude.toFixed(4)}, Lng: ${point.longitude.toFixed(4)}`,
      speedKph: point.speedKph,
      latitude: point.latitude,
      longitude: point.longitude,
      status: point.speedKph > 0 ? 'moving' : 'stopped'
    }));
  }

  private calculateSummary(points: VehicleHistoryPoint[]): void {
    const summary = calculateHistorySummary(points);
    this._totalDistance.set(summary.totalDistance);
    this._totalDuration.set(summary.totalDuration);
  }

  onClose() {
    this.closeRoute.emit();
  }

  onBackToForm() {
    this.backToForm.emit();
  }

  togglePlayback() {
    if (this.isPlaying()) {
      this.routePlayback.pause();
    } else {
      this.routePlayback.play(this.playbackSpeed());
    }
  }

  setPlaybackSpeed(speed: PlaybackSpeed) {
    this.playbackSpeed.set(speed);
    this.routePlayback.setSpeed(speed);
  }

  goToFirst() {
    this.routePlayback.seekTo(0);
    this.emitCurrentPoint();
  }

  goToPrevious() {
    this.routePlayback.seekTo(this.routePlayback.currentPointIndex - 1);
    this.emitCurrentPoint();
  }

  goToNext() {
    this.routePlayback.seekTo(this.routePlayback.currentPointIndex + 1);
    this.emitCurrentPoint();
  }

  goToLast() {
    this.routePlayback.seekTo(this.routePlayback.totalPoints - 1);
    this.emitCurrentPoint();
  }

  onPointClick(point: FormattedHistoryPoint) {
    this.routePlayback.seekTo(point.index);
    this.pointSelect.emit(point);
  }

  onSliderChange(event: CustomEvent) {
    const index = event.detail.value as number;
    this.routePlayback.seekTo(index);
    this.emitCurrentPoint();
  }

  private emitCurrentPoint() {
    const point = this.formattedPoints()[this.routePlayback.currentPointIndex];
    if (point) {
      this.pointSelect.emit(point);
    }
  }

  getFormattedFromDate(): string {
    return new Date(`${this.fromDate}T${this.fromHour}:${this.fromMinute}`).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getFormattedToDate(): string {
    return new Date(`${this.toDate}T${this.toHour}:${this.toMinute}`).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
