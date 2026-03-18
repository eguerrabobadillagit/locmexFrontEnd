import { Component, signal, inject, AfterViewInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-enterprise';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { PageHeaderComponent } from '../../core/components/page-header/page-header.component';
import { DataToolbarComponent } from '../../core/components/data-toolbar/data-toolbar.component';
import { FormVehicleWizardComponent } from './components/form-vehicle-wizard/form-vehicle-wizard.component';
import { IFilterOption } from '../../core/models/filter-option.interface';
import { Vehicle } from './interfaces/vehicle.model';
import { vehicleColumnDefs } from './utils/column-definitions.util';
import { vehicleFilterOptions, vehicleGridOptions } from './utils/grid-config.util';
import { mockVehicles } from './mock/mock-data';
import { VehicleService } from './services/vehicle.service';
import { CreateVehicleRequest, VehicleResponse } from './interfaces/vehicle-request.interface';
import { DeviceService } from '../devices/services/device.service';
import { CommandRequest } from '../devices/interfaces/device-command.interface';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    IonicModule,
    PageHeaderComponent,
    DataToolbarComponent,
    AgGridAngular,
    FormVehicleWizardComponent
  ],
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss']
})
export class VehiclesPage implements AfterViewInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly deviceService = inject(DeviceService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  vehicles = signal<VehicleResponse[]>([]);
  filteredVehicles = signal<VehicleResponse[]>([]);
  quickFilterText = signal<string>('');
  showVehicleWizard = signal<boolean>(false);
  selectedVehicleId = signal<string | undefined>(undefined);
  
  filterOptions: IFilterOption[] = vehicleFilterOptions;
  columnDefs: ColDef[] = vehicleColumnDefs;
  gridOptions: GridOptions = vehicleGridOptions;

  constructor() {
    this.loadVehicles();
  }

  ngAfterViewInit(): void {
    // Agregar event listeners para los botones de editar y eliminar
    setTimeout(() => {
      document.addEventListener('click', (event: any) => {
        const target = event.target as HTMLElement;
        
        // Botón editar
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          const button = target.classList.contains('edit-btn') ? target : target.closest('.edit-btn');
          const vehicleId = button?.getAttribute('data-vehicle-id');
          if (vehicleId) {
            this.onEditVehicle(vehicleId);
          }
        }
        
        // Botón eliminar (para implementar en el futuro)
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
          const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
          const vehicleId = button?.getAttribute('data-vehicle-id');
          if (vehicleId) {
            console.log('Delete vehicle:', vehicleId);
            // TODO: Implementar eliminación
          }
        }
        
        // Botón enlazar GPS
        if (target.classList.contains('link-btn') || target.closest('.link-btn')) {
          const button = target.classList.contains('link-btn') ? target : target.closest('.link-btn');
          const vehicleId = button?.getAttribute('data-vehicle-id');
          if (vehicleId) {
            this.onLinkGPS(vehicleId);
          }
        }
      });
    }, 100);
  }

  onAddVehicle() {
    this.selectedVehicleId.set(undefined);
    this.showVehicleWizard.set(true);
  }

  onEditVehicle(vehicleId: string) {
    this.selectedVehicleId.set(vehicleId);
    this.showVehicleWizard.set(true);
  }

  async onLinkGPS(vehicleId: string) {
    const alert = await this.alertController.create({
      header: 'Enlazar GPS',
      message: 'Se enviará un mensaje SMS para enlazar el GPS de tu vehículo a la plataforma',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Enviar SMS',
          handler: () => {
            this.sendLinkSMS(vehicleId);
          }
        }
      ]
    });

    await alert.present();
  }

  private async sendLinkSMS(vehicleId: string) {
    console.log('Sending link SMS for vehicle:', vehicleId);
    
    // Buscar el vehículo para obtener su deviceId
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    
    if (!vehicle || !vehicle.deviceId) {
      const toast = await this.toastController.create({
        message: 'El vehículo no tiene un dispositivo GPS asignado',
        duration: 3000,
        position: 'top',
        color: 'warning',
        icon: 'warning'
      });
      await toast.present();
      return;
    }
    
    // Preparar el comando para enviar al dispositivo
    const command: CommandRequest = {
      actionCode: 'init',
      params: {
        // Aquí puedes agregar parámetros adicionales si es necesario
      }
    };
    
    // Enviar comando al dispositivo
    this.deviceService.sendCommand(vehicle.deviceId, command).subscribe({
      next: async (response) => {
        console.log('Command sent successfully:', response);
        
        const toast = await this.toastController.create({
          message: 'SMS enviado exitosamente para enlazar el GPS',
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Error sending command:', err);
        
        const toast = await this.toastController.create({
          message: err.error?.message || 'Error al enviar el SMS. Por favor intenta de nuevo.',
          duration: 5000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
      }
    });
  }

  onWizardClose() {
    this.showVehicleWizard.set(false);
    this.selectedVehicleId.set(undefined);
  }

  onVehicleUpdated(vehicleData: any) {
    console.log('Vehicle data to update:', vehicleData);
    
    const { id, ...payload } = vehicleData;
    
    // Mapear el payload del wizard al formato de la API
    const vehicleRequest: CreateVehicleRequest = {
      plate: payload.plates,
      brandId: payload.vehicleBrandId,
      model: payload.model,
      vehicleYear: payload.year,
      vehicleTypeCode: payload.vehicleTypeCode,
      label: payload.plates,
      vin: '',
      statusCode: 'active',
      isActive: true,
      clientId: payload.clientId,
      deviceId: payload.deviceId,
      driverId: payload.driverId
    };

    console.log('Updating vehicle with ID:', id);
    console.log('Sending to API:', vehicleRequest);

    this.vehicleService.updateVehicle(id, vehicleRequest).subscribe({
      next: async (response) => {
        console.log('Vehicle updated successfully:', response);
        this.showVehicleWizard.set(false);
        this.selectedVehicleId.set(undefined);
        
        // Mostrar toast de éxito
        const toast = await this.toastController.create({
          message: `Vehículo ${response.plate} actualizado exitosamente`,
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();
        
        // Recargar la lista de vehículos
        this.loadVehicles();
      },
      error: async (err) => {
        console.error('Error updating vehicle:', err);
        
        // Mostrar toast de error
        const toast = await this.toastController.create({
          message: err.error?.message || 'Error al actualizar el vehículo. Por favor intenta de nuevo.',
          duration: 5000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
      }
    });
  }

  onVehicleCreated(vehicleData: any) {
    console.log('Vehicle data from wizard:', vehicleData);
    
    // Mapear el payload del wizard al formato de la API
    const vehicleRequest: CreateVehicleRequest = {
      plate: vehicleData.plates,
      brandId: vehicleData.vehicleBrandId,
      model: vehicleData.model,
      vehicleYear: vehicleData.year,
      vehicleTypeCode: vehicleData.vehicleTypeCode,
      label: vehicleData.plates, // Usar la placa como label por defecto
      vin: '', // Campo opcional
      statusCode: 'active', // Estado por defecto
      isActive: true,
      clientId: vehicleData.clientId,
      deviceId: vehicleData.deviceId,
      driverId: vehicleData.driverId
    };

    console.log('Sending to API:', vehicleRequest);

    this.vehicleService.createVehicle(vehicleRequest).subscribe({
      next: async (response) => {
        console.log('Vehicle created successfully:', response);
        this.showVehicleWizard.set(false);
        
        // Mostrar toast de éxito
        const toast = await this.toastController.create({
          message: `Vehículo ${response.plate} creado exitosamente`,
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();
        
        // Recargar la lista de vehículos
        this.loadVehicles();
      },
      error: async (err) => {
        console.error('Error creating vehicle:', err);
        
        // Mostrar toast de error
        const toast = await this.toastController.create({
          message: err.error?.message || 'Error al crear el vehículo. Por favor intenta de nuevo.',
          duration: 5000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
        
        // Mantener el wizard abierto para correcciones
      }
    });
  }

  onSearch(searchTerm: string) {
    this.quickFilterText.set(searchTerm);
  }

  onFilterChange(filterValue: string | number) {
    console.log('Filter:', filterValue);
  }

  onViewChange(view: 'list' | 'grid') {
    console.log('View changed:', view);
  }

  private loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        console.log('Vehicles loaded:', vehicles);
        this.vehicles.set(vehicles as any);
        this.filteredVehicles.set(vehicles as any);
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
      }
    });
  }
}
