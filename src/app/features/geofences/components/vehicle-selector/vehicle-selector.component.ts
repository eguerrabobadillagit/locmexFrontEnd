import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonAccordion, IonAccordionGroup, IonItem, IonCheckbox, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, carOutline } from 'ionicons/icons';
import { VehicleResponse } from '../../../vehicles/interfaces/vehicle-request.interface';

@Component({
  selector: 'app-vehicle-selector',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonCheckbox,
    IonLabel
  ],
  templateUrl: './vehicle-selector.component.html',
  styleUrls: ['./vehicle-selector.component.scss']
})
export class VehicleSelectorComponent {
  vehicles = input<VehicleResponse[]>([]);
  selectedIds = input<string[]>([]);
  
  selectionChange = output<string[]>();

  constructor() {
    addIcons({ chevronDownOutline, carOutline });
  }

  selectedCount = computed(() => this.selectedIds().length);

  isSelected(vehicleId: string): boolean {
    return this.selectedIds().includes(vehicleId);
  }

  toggleVehicle(vehicleId: string): void {
    const currentSelection = [...this.selectedIds()];
    const index = currentSelection.indexOf(vehicleId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(vehicleId);
    }
    
    this.selectionChange.emit(currentSelection);
  }

  selectAll(): void {
    const allIds = this.vehicles().map(v => v.id);
    this.selectionChange.emit(allIds);
  }

  deselectAll(): void {
    this.selectionChange.emit([]);
  }

  getVehicleSubtitle(vehicle: VehicleResponse): string {
    if (vehicle.brandName && vehicle.model) {
      return `${vehicle.brandName} ${vehicle.model}`;
    }
    return vehicle.brandName || vehicle.model || 'Sin información';
  }
}
