import { Component, input, output, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonInput,
  IonToggle,
  IonCheckbox,
  IonButton,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  locationOutline,
  checkmarkOutline,
  radioButtonOnOutline,
  shapesOutline,
  squareOutline,
  notificationsOutline,
  notificationsOffOutline,
  timeOutline,
  alertCircleOutline,
  carOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { VehicleService } from '../../../vehicles/services/vehicle.service';
import { VehicleResponse } from '../../../vehicles/interfaces/vehicle-request.interface';
import { GeofenceResponse, CreateGeofenceRequest } from '../../interfaces/geofence-request.interface';

export type ShapeType = 'circular' | 'polygon' | 'rectangle';
export type GeofenceFormMode = 'create' | 'edit';

export interface GeofenceSidebarFormData {
  name: string;
  shapeType: ShapeType;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  alertOnStay: boolean;
  vehicleIds: string[];
}

@Component({
  selector: 'app-geofence-sidebar-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonInput,
    IonToggle,
    IonCheckbox,
    IonButton,
    IonSegment,
    IonSegmentButton
  ],
  templateUrl: './geofence-sidebar-form.component.html',
  styleUrls: ['./geofence-sidebar-form.component.scss']
})
export class GeofenceSidebarFormComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);

  // Inputs
  mode = input<'create' | 'edit'>('create');
  geofence = input<GeofenceResponse | null>(null);

  // Outputs
  save = output<GeofenceSidebarFormData>();
  cancel = output<void>();
  close = output<void>();
  shapeTypeChange = output<ShapeType>();

  // Signals para el formulario
  name = signal<string>('');
  shapeType = signal<ShapeType>('circular');
  isActive = signal<boolean>(true);
  alertOnEnter = signal<boolean>(true);
  alertOnExit = signal<boolean>(false);
  alertOnStay = signal<boolean>(false);
  selectedVehicleIds = signal<string[]>([]);

  // Signals para vehículos
  vehicles = signal<VehicleResponse[]>([]);
  vehicleSearchText = signal<string>('');
  filteredVehicles = signal<VehicleResponse[]>([]);
  showVehicleList = signal<boolean>(false);
  selectedVehiclesList = signal<VehicleResponse[]>([]);

  constructor() {
    addIcons({
      closeOutline,
      locationOutline,
      checkmarkOutline,
      radioButtonOnOutline,
      shapesOutline,
      squareOutline,
      notificationsOutline,
      notificationsOffOutline,
      timeOutline,
      alertCircleOutline
    });

    // Effect para cargar datos cuando cambia la geocerca
    effect(() => {
      const geofenceData = this.geofence();
      if (geofenceData && this.mode() === 'edit') {
        this.populateForm(geofenceData);
      }
    });

    // Effect para emitir cambios de tipo de forma
    effect(() => {
      const type = this.shapeType();
      this.shapeTypeChange.emit(type);
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
      }
    });
  }

  populateForm(geofence: GeofenceResponse): void {
    this.name.set(geofence.name || '');
    this.isActive.set(geofence.isActive ?? true);
    this.alertOnEnter.set(geofence.alertOnEnter ?? true);
    this.alertOnExit.set(geofence.alertOnExit ?? false);

    // Alert on stay no está en el modelo actual, se deja en false por defecto
    this.alertOnStay.set(false);

    // Mapear geometryType a shapeType
    if (geofence.geometryType) {
      const geometryTypeMap: Record<string, ShapeType> = {
        'circle': 'circular',
        'circular': 'circular',
        'polygon': 'polygon',
        'rectangle': 'rectangle',
        'rect': 'rectangle'
      };
      this.shapeType.set(geometryTypeMap[geofence.geometryType] || 'circular');
    }

    // Cargar vehículo vinculado si existe
    if (geofence.vehicleId) {
      this.selectedVehicleIds.set([geofence.vehicleId]);
      const vehicle = this.vehicles().find(v => v.id === geofence.vehicleId);
      if (vehicle) {
        this.selectedVehiclesList.set([vehicle]);
        this.vehicleSearchText.set(vehicle.plate);
      }
    }
  }

  onShapeTypeChange(type: string | ShapeType): void {
    const validTypes: ShapeType[] = ['circular', 'polygon', 'rectangle'];
    if (validTypes.includes(type as ShapeType)) {
      this.shapeType.set(type as ShapeType);
    }
  }

  onVehicleSelectionChange(selectedIds: string[]): void {
    this.selectedVehicleIds.set(selectedIds);
  }

  onSave(): void {
    const formData: GeofenceSidebarFormData = {
      name: this.name(),
      shapeType: this.shapeType(),
      isActive: this.isActive(),
      alertOnEnter: this.alertOnEnter(),
      alertOnExit: this.alertOnExit(),
      alertOnStay: this.alertOnStay(),
      vehicleIds: this.selectedVehicleIds()
    };
    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  isFormValid(): boolean {
    return this.name().trim().length > 0 && this.selectedVehicleIds().length > 0;
  }

  getHeaderTitle(): string {
    return this.mode() === 'create' ? 'Nueva Geocerca' : 'Editar Geocerca';
  }

  // ==================== VEHICLE AUTOCOMPLETE METHODS ====================
  onVehicleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.vehicleSearchText.set((event.target as HTMLInputElement).value);

    if (value) {
      const filtered = this.vehicles().filter(vehicle =>
        vehicle.plate.toLowerCase().includes(value) ||
        (vehicle.brandName && vehicle.brandName.toLowerCase().includes(value)) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(value))
      );
      this.filteredVehicles.set(filtered);
      this.showVehicleList.set(filtered.length > 0);
    } else {
      this.filteredVehicles.set(this.vehicles());
      this.showVehicleList.set(this.vehicles().length > 0);
    }
  }

  onVehicleFocus(): void {
    const currentValue = this.vehicleSearchText().toLowerCase();
    if (currentValue) {
      const filtered = this.vehicles().filter(vehicle =>
        vehicle.plate.toLowerCase().includes(currentValue) ||
        (vehicle.brandName && vehicle.brandName.toLowerCase().includes(currentValue)) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(currentValue))
      );
      this.filteredVehicles.set(filtered);
      this.showVehicleList.set(filtered.length > 0);
    } else {
      this.filteredVehicles.set(this.vehicles());
      this.showVehicleList.set(this.vehicles().length > 0);
    }
  }

  selectVehicle(vehicle: VehicleResponse): void {
    // Set text in input
    this.vehicleSearchText.set(vehicle.plate);

    // Add to selected if not already
    const isAlreadySelected = this.selectedVehiclesList().some(v => v.id === vehicle.id);
    if (!isAlreadySelected) {
      this.selectedVehiclesList.set([vehicle]);
      this.selectedVehicleIds.set([vehicle.id]);
    }

    // Hide dropdown
    this.showVehicleList.set(false);
    this.filteredVehicles.set([]);
  }

  clearVehicleSelection(): void {
    this.selectedVehiclesList.set([]);
    this.selectedVehicleIds.set([]);
    this.vehicleSearchText.set('');
    this.showVehicleList.set(false);
  }
}
