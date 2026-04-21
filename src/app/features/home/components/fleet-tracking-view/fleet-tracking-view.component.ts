import { Component, OnInit, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, alertCircleOutline, analyticsOutline } from 'ionicons/icons';
import { VehicleSelectionService } from '../../../services/vehicle-selection';
import { VehicleVisibilityService } from '../../../services/vehicle-visibility.service';
import { Vehicle } from '../../../vehicles/interfaces/vehicle.interface';
import { UnitsListComponent } from '../units-list/units-list.component';
import { VehicleHistoryFormComponent } from '../../../vehicles/components/vehicle-history-form/vehicle-history-form.component';
import { VehicleHistoryRouteComponent } from '../../../vehicles/components/vehicle-history-route/vehicle-history-route.component';
import { VehicleHistoryRequest, VehicleHistoryPoint, FormattedHistoryPoint } from '../../../vehicles/interfaces/vehicle-history.interface';
import { RoutePlaybackService } from '../../../map/service/route-playback.service';
import { VehicleHistoryService } from '../../../vehicles/services/vehicle-history.service';
import { calculateHistorySummary, formatHistoryTime } from '../../../vehicles/utils/vehicle-history.utils';
import { HistoryDateHelperService } from '../../../vehicles/services/history-date-helper.service';

@Component({
  selector: 'app-fleet-tracking-view',
  templateUrl: './fleet-tracking-view.component.html',
  styleUrls: ['./fleet-tracking-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    UnitsListComponent,
    VehicleHistoryFormComponent,
    VehicleHistoryRouteComponent,
  ],
})
export class FleetTrackingViewComponent implements OnInit {
  // Inputs from parent (SidebarComponent)
  vehicles = input<Vehicle[]>([]);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  viewMode = input<'card' | 'list'>('list');

  // Outputs to parent
  vehicleSelect = output<string>();
  viewModeToggle = output<void>();
  closeView = output<void>();
  retryLoad = output<void>();
  openHistory = output<Vehicle>();
  mobileSidebarClose = output<void>();
  mobileSidebarOpen = output<void>();

  // View mode: 'list' shows units, 'history' shows history form/route
  sidebarViewMode = signal<'list' | 'history'>('list');
  selectedHistoryVehicle = signal<Vehicle | null>(null);
  historySubViewMode = signal<'form' | 'route'>('form');
  historyRequestData = signal<VehicleHistoryRequest | null>(null);

  // History loading state
  isLoadingHistory = signal<boolean>(false);
  historyError = signal<string | null>(null);
  historyPoints = signal<VehicleHistoryPoint[]>([]);
  formattedHistoryPoints = signal<FormattedHistoryPoint[]>([]);
  totalHistoryDistance = signal<string>('0 km');
  totalHistoryDuration = signal<string>('0h 0m');
  totalHistoryPoints = signal<number>(0);

  private get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  constructor() {
    addIcons({
      closeOutline,
      alertCircleOutline,
      analyticsOutline,
    });
  }

  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private readonly vehicleVisibilityService = inject(VehicleVisibilityService);
  private readonly routePlayback = inject(RoutePlaybackService);
  private readonly historyDateHelper = inject(HistoryDateHelperService);
  private readonly historyService = inject(VehicleHistoryService);

  onVehicleSelect(vehicleId: string) {
    this.vehicleSelectionService.selectVehicle(vehicleId);
    this.vehicleSelect.emit(vehicleId);
  }

  onViewModeToggle() {
    this.viewModeToggle.emit();
  }

  onRetryLoad() {
    this.retryLoad.emit();
  }

  onOpenHistoryClicked(vehicle: Vehicle) {
    this.openHistory.emit(vehicle);
    this.openHistoryView(vehicle);
  }

  onCloseSidebar() {
    this.closeView.emit();
  }

  // History methods
  openHistoryView(vehicle: Vehicle) {
    this.selectedHistoryVehicle.set(vehicle);
    this.historySubViewMode.set('form');
    this.historyRequestData.set(null);
    this.sidebarViewMode.set('history');
  }

  closeHistoryView() {
    this.routePlayback.clearRoute();
    this.sidebarViewMode.set('list');
    this.selectedHistoryVehicle.set(null);
    this.historyRequestData.set(null);
    if (this.isMobile) {
      this.mobileSidebarOpen.emit();
    }
  }

  onHistorySearch(request: VehicleHistoryRequest) {
    this.historyRequestData.set(request);
    this.loadHistoryData(request);
  }

  private loadHistoryData(request: VehicleHistoryRequest) {
    this.isLoadingHistory.set(true);
    this.historyError.set(null);
    this.routePlayback.setLoadingRoute(true);

    const fromDateTime = `${request.fromDate}T${request.fromHour}:${request.fromMinute}:00`;
    const toDateTime = `${request.toDate}T${request.toHour}:${request.toMinute}:59`;
    const fromUtc = new Date(fromDateTime).toISOString();
    const toUtc = new Date(toDateTime).toISOString();

    this.historyService.getVehicleHistory({
      vehicleId: request.vehicleId,
      fromUtc,
      toUtc
    }).subscribe({
      next: (points) => {
        this.historyPoints.set(points);
        this.formattedHistoryPoints.set(this.formatHistoryPoints(points));
        this.calculateHistorySummary(points);
        this.totalHistoryPoints.set(points.length);
        this.routePlayback.loadRoute(points);
        this.isLoadingHistory.set(false);
        this.routePlayback.setLoadingRoute(false);
        this.historySubViewMode.set('route');

        if (this.isMobile) {
          this.mobileSidebarClose.emit();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[FleetTrackingView] Error al cargar historial:', err);
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
        this.historyError.set(errorMessage);
        this.isLoadingHistory.set(false);
        this.routePlayback.setLoadingRoute(false);
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

  private calculateHistorySummary(points: VehicleHistoryPoint[]): void {
    const summary = calculateHistorySummary(points);
    this.totalHistoryDistance.set(summary.totalDistance);
    this.totalHistoryDuration.set(summary.totalDuration);
  }

  onBackToHistoryForm() {
    this.historySubViewMode.set('form');
  }

  onHistoryPointSelect(point: FormattedHistoryPoint) {
    this.routePlayback.seekTo(point.index);
  }

  getHistoryFromDate(): string {
    return this.historyDateHelper.getFromDate(this.historyRequestData());
  }

  getHistoryFromHour(): string {
    return this.historyDateHelper.getFromHour(this.historyRequestData());
  }

  getHistoryFromMinute(): string {
    return this.historyDateHelper.getFromMinute(this.historyRequestData());
  }

  getHistoryToDate(): string {
    return this.historyDateHelper.getToDate(this.historyRequestData());
  }

  getHistoryToHour(): string {
    return this.historyDateHelper.getToHour(this.historyRequestData());
  }

  getHistoryToMinute(): string {
    return this.historyDateHelper.getToMinute(this.historyRequestData());
  }

  ngOnInit() {
    // Inicializar todos los vehículos como visibles por defecto
    const allVehicleIds = this.vehicles().map(v => v.id);
    if (allVehicleIds.length > 0) {
      this.vehicleVisibilityService.showAll(allVehicleIds);
    }
  }

  toggleVehicleSelection(vehicleId: string, selected: boolean) {
    if (selected) {
      this.vehicleVisibilityService.showVehicle(vehicleId);
    } else {
      this.vehicleVisibilityService.hideVehicle(vehicleId);
    }
  }

  toggleSelectAll(selected: boolean) {
    const allVehicleIds = this.vehicles().map(v => v.id);
    if (selected) {
      this.vehicleVisibilityService.showAll(allVehicleIds);
    } else {
      this.vehicleVisibilityService.hideAll();
    }
  }

  isVehicleVisible(vehicleId: string): boolean {
    return this.vehicleVisibilityService.isVisible(vehicleId);
  }
}
