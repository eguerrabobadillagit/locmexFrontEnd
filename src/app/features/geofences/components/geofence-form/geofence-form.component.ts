import { Component, signal, output, input, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../vehicles/services/vehicle.service';
import { VehicleResponse } from '../../../vehicles/interfaces/vehicle-request.interface';

export interface GeofenceFormData {
  name: string;
  shapeType: 'circular' | 'polygon' | 'rectangle';
  alertOnEnter: boolean;
  alertOnExit: boolean;
  isActive: boolean;
  vehicleIds?: string[];
}

@Component({
  selector: 'app-geofence-form',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  templateUrl: './geofence-form.component.html',
  styleUrls: ['./geofence-form.component.scss']
})
export class GeofenceFormComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  
  // Vehicle autocomplete
  vehicles = signal<VehicleResponse[]>([]);
  filteredVehicles = signal<VehicleResponse[]>([]);
  showVehicleList = signal<boolean>(false);
  selectedVehiclesList = signal<VehicleResponse[]>([]);
  vehicleSearchText = signal<string>('');
  // Inputs
  geofenceData = input<any>(null);
  hasDrawnGeofence = input<boolean>(false);
  isEditMode = input<boolean>(false);
  
  // Form data signals
  name = signal<string>('');
  shapeType = signal<'circular' | 'polygon' | 'rectangle'>('circular');
  alertOnEnter = signal<boolean>(true);
  alertOnExit = signal<boolean>(true);
  isActive = signal<boolean>(true);
  selectedVehicles = signal<string[]>([]);

  constructor() {
    // Effect to populate form when geofence data is provided
    effect(() => {
      const data = this.geofenceData();
      if (data) {
        this.populateForm(data);
      }
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

  // Vehicle autocomplete methods
  onVehicleInput(event: any): void {
    const value = event.target.value.toLowerCase();
    this.vehicleSearchText.set(event.target.value);
    
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
      this.onVehicleInput({ target: { value: currentValue } });
    } else {
      this.filteredVehicles.set(this.vehicles());
      this.showVehicleList.set(this.vehicles().length > 0);
    }
  }

  selectVehicle(vehicle: VehicleResponse): void {
    // Set the selected vehicle text in the input
    const vehicleText = `${vehicle.plate} - ${vehicle.brandName || ''} ${vehicle.model || ''}`.trim();
    this.vehicleSearchText.set(vehicleText);
    
    // Add to selected vehicles list if not already selected
    const isAlreadySelected = this.selectedVehiclesList().some(v => v.id === vehicle.id);
    if (!isAlreadySelected) {
      this.selectedVehiclesList.update(list => [...list, vehicle]);
      this.selectedVehicles.update(ids => [...ids, vehicle.id]);
    }
    
    // Hide the dropdown
    this.showVehicleList.set(false);
    this.filteredVehicles.set([]);
  }

  removeVehicle(vehicleId: string): void {
    this.selectedVehiclesList.update(list => list.filter(v => v.id !== vehicleId));
    this.selectedVehicles.update(ids => ids.filter(id => id !== vehicleId));
  }

  // Output events
  save = output<GeofenceFormData>();
  cancel = output<void>();
  shapeTypeChange = output<'circular' | 'polygon' | 'rectangle'>();

  onShapeTypeChange(type: 'circular' | 'polygon' | 'rectangle'): void {
    this.shapeType.set(type);
    this.shapeTypeChange.emit(type);
  }

  onSave(): void {
    const formData: GeofenceFormData = {
      name: this.name(),
      shapeType: this.shapeType(),
      alertOnEnter: this.alertOnEnter(),
      alertOnExit: this.alertOnExit(),
      isActive: this.isActive(),
      vehicleIds: this.selectedVehicles()
    };
    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFormValid(): boolean {
    const hasName = this.name().trim().length > 0;
    const hasVehicle = this.selectedVehicles().length > 0;
    const hasGeofence = this.hasDrawnGeofence();
    
    return hasName && hasVehicle && hasGeofence;
  }

  populateForm(geofence: any): void {
    this.name.set(geofence.name || '');
    this.alertOnEnter.set(geofence.alertOnEnter ?? true);
    this.alertOnExit.set(geofence.alertOnExit ?? true);
    this.isActive.set(geofence.isActive ?? true);
    
    // Load linked vehicle if exists
    if (geofence.vehicleId) {
      const vehicle = this.vehicles().find(v => v.id === geofence.vehicleId);
      if (vehicle) {
        // Set the vehicle in the input text
        this.vehicleSearchText.set(vehicle.plate);
        // Add to selected lists
        this.selectedVehicles.set([vehicle.id]);
        this.selectedVehiclesList.set([vehicle]);
      }
    }
    
    // Map geometryType from backend to shapeType for form
    if (geofence.geometryType) {
      const geometryTypeMap: Record<string, 'circular' | 'polygon' | 'rectangle'> = {
        'circle': 'circular',
        'polygon': 'polygon',
        'rectangle': 'rectangle'
      };
      this.shapeType.set(geometryTypeMap[geofence.geometryType] || 'circular');
    } else {
      // Fallback: determine from geoJson if geometryType not available
      try {
        const geoJson = JSON.parse(geofence.geoJson);
        if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
          this.shapeType.set('polygon');
        } else {
          this.shapeType.set('circular');
        }
      } catch (e) {
        this.shapeType.set('circular');
      }
    }
  }
}
