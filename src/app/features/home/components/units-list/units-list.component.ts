import { Component, input, output, signal, computed, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonSpinner, IonCheckbox } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  carOutline, speedometerOutline, batteryHalfOutline, powerOutline,
  eyeOutline, listOutline, gridOutline, closeOutline, analyticsOutline, alertCircleOutline
} from 'ionicons/icons';
import { Vehicle, getVehicleStatusClass } from '../../../vehicles/interfaces/vehicle.interface';
import { VehicleVisibilityService } from '../../../services/vehicle-visibility.service';
import { VehicleSelectionService } from '../../../services/vehicle-selection';
import { getSpeedColor, getSpeedHexColor, SpeedColor } from '../../../vehicles/utils/vehicle-history.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list.component.html',
  styleUrls: ['./units-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonCheckbox,
  ],
})
export class UnitsListComponent implements OnInit, OnDestroy {
  vehicles = input<Vehicle[]>([]);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  viewMode = input<'card' | 'list'>('list');

  vehicleClick = output<string>();
  viewModeToggle = output<void>();
  close = output<void>();
  retry = output<void>();
  openHistory = output<Vehicle>();
  openStreetView = output<Vehicle>();
  vehicleSelectionChange = output<{ vehicleId: string; selected: boolean }>();
  selectAllChange = output<boolean>();

  // Signals para selección
  selectedVehicles = signal<Set<string>>(new Set());
  selectedVehicleId = signal<string | null>(null);

  // Computed para conteo
  selectedCount = computed(() => this.selectedVehicles().size);

  private readonly vehicleVisibilityService = inject(VehicleVisibilityService);
  private readonly vehicleSelectionService = inject(VehicleSelectionService);
  private subscription = new Subscription();

  constructor() {
    // Efecto para sincronizar con VehicleVisibilityService
    effect(() => {
      const visibleIds = this.vehicleVisibilityService.selectedVehicleIds();
      this.selectedVehicles.set(new Set(visibleIds));
    });

    addIcons({
      carOutline,
      closeOutline,
      alertCircleOutline,
      analyticsOutline,
      eyeOutline,
      speedometerOutline,
      batteryHalfOutline,
      powerOutline,
      listOutline,
      gridOutline,
    });
  }

  ngOnInit() {
    // Inicializar todos los vehículos seleccionados por defecto
    const allIds = this.vehicles().map(v => v.id);
    this.vehicleVisibilityService.showAll(allIds);

    // Suscribirse a selecciones desde el mapa
    this.subscription.add(
      this.vehicleSelectionService.vehicleSelected$.subscribe(vehicleId => {
        this.selectedVehicleId.set(vehicleId);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onVehicleClick(vehicleId: string) {
    this.selectedVehicleId.set(vehicleId);
    this.vehicleClick.emit(vehicleId);
  }

  toggleViewMode() {
    this.viewModeToggle.emit();
  }

  onClose() {
    this.close.emit();
  }

  onRetry() {
    this.retry.emit();
  }

  onOpenHistory(vehicle: Vehicle, event: Event) {
    event.stopPropagation();
    this.openHistory.emit(vehicle);
  }

  onOpenStreetView(vehicle: Vehicle, event: Event) {
    event.stopPropagation();
    this.openStreetView.emit(vehicle);
  }

  getStatusClass(status: string): string {
    return getVehicleStatusClass(status);
  }

  /**
   * Obtiene la clase CSS para el color de velocidad basado en thresholds centralizados:
   * - Gris: 0 km/h (detenido)
   * - Verde: 1-40 km/h
   * - Amarillo: 41-80 km/h
   * - Rojo: >80 km/h
   */
  getSpeedColorClass(speed: number): string {
    const color = getSpeedColor(speed);
    return `speed-${color}`;
  }

  /**
   * Obtiene el color hexadecimal para la velocidad (útil para estilos inline)
   */
  getSpeedColorHex(speed: number): string {
    return getSpeedHexColor(getSpeedColor(speed));
  }

  onVehicleCheckboxClick(vehicleId: string) {
    const currentlyVisible = this.vehicleVisibilityService.isVisible(vehicleId);
    if (currentlyVisible) {
      this.vehicleVisibilityService.hideVehicle(vehicleId);
    } else {
      this.vehicleVisibilityService.showVehicle(vehicleId);
    }
    this.vehicleSelectionChange.emit({ vehicleId, selected: !currentlyVisible });
  }

  onSelectAllClick() {
    const allIds = this.vehicles().map(v => v.id);
    const allSelected = this.selectedCount() === allIds.length;
    if (allSelected) {
      this.vehicleVisibilityService.hideAll();
    } else {
      this.vehicleVisibilityService.showAll(allIds);
    }
    this.selectAllChange.emit(!allSelected);
  }

  isVehicleSelected(vehicleId: string): boolean {
    return this.vehicleVisibilityService.isVisible(vehicleId);
  }
}
