import { Component, OnInit, Input, output, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { WizardStepperComponent } from '../../../../core/components/wizard-stepper/wizard-stepper.component';
import { WizardConfig, WizardStep } from '../../../../core/interfaces/wizard.interface';
import { ModalSearchableGridComponent } from '../../../../core/components/modal-searchable-grid/modal-searchable-grid.component';
import { WizardConfirmationSummaryComponent, ConfirmationSection } from '../../../../core/components/wizard-confirmation-summary/wizard-confirmation-summary.component';
import { ColDef } from 'ag-grid-community';
import { Client } from '../../../devices/interfaces/client.interface';
import { ClientService } from '../../../devices/services/client.service';
import { DeviceService } from '../../../devices/services/device.service';
import { CatalogService } from '../../../devices/services/catalog.service';
import { VehicleBrand, VehicleType, Driver } from '../../../devices/interfaces/catalog.interface';
import { DeviceResponse } from '../../../devices/interfaces/device-response.interface';
import { getClientColumnDefs } from '../../../devices/utils/client-grid-columns.util';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleResponse } from '../../interfaces/vehicle-request.interface';

@Component({
  selector: 'app-form-vehicle-wizard',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, WizardStepperComponent, ModalSearchableGridComponent, WizardConfirmationSummaryComponent],
  templateUrl: './form-vehicle-wizard.component.html',
  styleUrls: ['./form-vehicle-wizard.component.scss']
})
export class FormVehicleWizardComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly deviceService = inject(DeviceService);
  private readonly catalogService = inject(CatalogService);
  private readonly vehicleService = inject(VehicleService);
  
  @Input() vehicleId?: string;
  
  wizardClosed = output<void>();
  vehicleCreated = output<any>();
  vehicleUpdated = output<any>();

  currentStep = signal(0);

  wizardConfig = signal<WizardConfig>({
    title: 'Agregar Nuevo Vehículo',
    icon: 'car-outline',
    totalSteps: 5,
    closable: true
  });

  steps = signal<WizardStep[]>([
    { id: 'client-assignment', label: 'Asignación', icon: 'person-outline', completed: false },
    { id: 'vehicle-info', label: 'Vehículo', icon: 'car-outline', completed: false },
    { id: 'gps-device', label: 'Dispositivo GPS', icon: 'location-outline', completed: false },
    { id: 'driver', label: 'Conductor', icon: 'person-circle-outline', completed: false },
    { id: 'confirmation', label: 'Confirmación', icon: 'checkmark-done-outline', completed: false }
  ]);

  // Client selection
  clients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);

  // Vehicle brand autocomplete
  vehicleBrands = signal<VehicleBrand[]>([]);
  filteredBrands = signal<VehicleBrand[]>([]);
  showBrandList = signal<boolean>(false);
  selectedBrandId = signal<string | null>(null);

  // Vehicle types
  vehicleTypes = signal<VehicleType[]>([]);
  filteredVehicleTypes = signal<VehicleType[]>([]);
  showVehicleTypeList = signal<boolean>(false);
  selectedVehicleType = signal<VehicleType | null>(null);

  // GPS Devices
  devices = signal<DeviceResponse[]>([]);
  selectedDevice = signal<DeviceResponse | null>(null);
  
  // Dispositivos disponibles (sin asignar a ningún cliente)
  availableDevices = computed(() => 
    this.devices().filter(device => device.clientId === null)
  );

  // Drivers
  drivers = signal<Driver[]>([]);
  selectedDriver = signal<Driver | null>(null);

  vehicleInfoForm!: FormGroup;
  gpsDeviceForm!: FormGroup;
  driverForm!: FormGroup;
  clientForm!: FormGroup;

  // AG Grid column definitions for clients
  clientColumnDefs = computed<ColDef[]>(() => 
    getClientColumnDefs(this.selectedClient()?.id)
  );




  gpsDevicesColumnDefs = computed<ColDef[]>(() => [
    {
      headerName: 'Dispositivo GPS',
      field: 'imei',
      flex: 1,
      cellRenderer: (params: any) => {
        const isSelected = this.selectedDevice()?.id === params.data.id;
        const alias = params.data.alias || 'Cliente aún no asignado';
        const modelName = params.data.modelName || '';
        return `
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
            <ion-icon name="hardware-chip" style="font-size: 20px; color: ${isSelected ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'};"></ion-icon>
            <span style="font-weight: ${isSelected ? '600' : '500'}; font-size: 14px; color: ${isSelected ? 'var(--ion-color-primary)' : '#1f2937'};">${params.data.imei}</span>
            <span style="color: var(--ion-color-medium); font-size: 13px;">${alias}</span>
            <span style="color: var(--ion-color-medium); font-size: 13px;">${modelName}</span>
          </div>
        `;
      }
    }
  ]);

  driversColumnDefs = computed<ColDef[]>(() => [
    {
      headerName: 'Conductor',
      field: 'fullName',
      flex: 1,
      cellRenderer: (params: any) => {
        const isSelected = this.selectedDriver()?.id === params.data.id;
        return `
          <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0;">
            <ion-icon name="person-outline" style="font-size: 20px; color: ${isSelected ? 'var(--ion-color-primary)' : '#6b7280'};"></ion-icon>
            <span style="font-weight: ${isSelected ? '600' : '500'}; font-size: 14px; color: ${isSelected ? 'var(--ion-color-primary)' : '#1f2937'};">${params.data.fullName}</span>
          </div>
        `;
      }
    }
  ]);

  confirmationSections = computed<ConfirmationSection[]>(() => {
    const sections: ConfirmationSection[] = [];

    // Sección 1: Cliente Asignado
    const client = this.selectedClient();
    if (client) {
      sections.push({
        title: 'Cliente Asignado',
        subtitle: 'Propietario del vehículo',
        icon: 'person-outline',
        iconColor: '#10b981',
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
        fields: [
          { label: 'Cliente', value: client.name, icon: 'person-outline' },
          { label: 'Contacto', value: client.contactName, icon: 'person-outline' },
          { label: 'Correo', value: client.contactEmail, icon: 'mail-outline' }
        ]
      });
    }

    // Sección 2: Información del Vehículo
    sections.push({
      title: 'Información del Vehículo',
      subtitle: 'Detalles básicos de identificación',
      icon: 'car-outline',
      iconColor: '#3b82f6',
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      fields: [
        { label: 'Placa', value: this.vehicleInfoForm.value.plates || '-', icon: 'document-text-outline' },
        { label: 'Marca & Modelo', value: `${this.vehicleInfoForm.value.brand || '-'} ${this.vehicleInfoForm.value.model || '-'}`, icon: 'car-outline' },
        { label: 'Año', value: this.vehicleInfoForm.value.year?.toString() || '-', icon: 'calendar-outline' },
        { label: 'Tipo', value: this.vehicleInfoForm.value.vehicleType || '-', icon: 'car-outline' }
      ]
    });

    // Sección 3: Dispositivo GPS
    const selectedDevice = this.selectedDevice();
    
    sections.push({
      title: 'Dispositivo GPS',
      subtitle: 'Dispositivo vinculado al vehículo',
      icon: 'hardware-chip',
      iconColor: '#a855f7',
      backgroundColor: '#f3e8ff',
      borderColor: '#a855f7',
      fields: [
        { label: 'Dispositivo', value: selectedDevice ? `${selectedDevice.alias}\n${selectedDevice.brandName} ${selectedDevice.modelName}` : '-', icon: 'hardware-chip' },
        { label: 'IMEI', value: this.gpsDeviceForm.value.imei || '-', icon: 'barcode-outline' },
        { label: 'Número de Teléfono', value: this.gpsDeviceForm.value.phoneNumber || '-', icon: 'call-outline' },
        { label: 'Compañía Telefónica', value: this.gpsDeviceForm.value.phoneCarrier || '-', icon: 'business-outline' }
      ]
    });

    // Sección 3: Conductor (si hay uno asignado)
    if (this.driverForm.value.driverId) {
      const statusLabel = this.driverForm.value.initialStatus === 'active' ? 'Activo' : 'Inactivo';
      sections.push({
        title: 'Conductor Asignado',
        subtitle: 'Responsable del vehículo',
        icon: 'person-outline',
        iconColor: '#10b981',
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
        fields: [
          { label: 'Conductor', value: this.driverForm.value.driverName || '-', icon: 'person-outline' },
          { label: 'Estado Inicial', value: statusLabel, icon: 'checkmark-circle-outline' }
        ]
      });
    }

    return sections;
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadClients();
  }

  private loadClients(): void {
    const requests: any = {
      clients: this.clientService.getClients(),
      vehicleBrands: this.catalogService.getVehicleBrands(),
      vehicleTypes: this.catalogService.getVehicleTypes(),
      devices: this.deviceService.getDevices(),
      drivers: this.catalogService.getDrivers()
    };

    // Si estamos en modo edición, agregar la petición del vehículo
    if (this.vehicleId) {
      requests.vehicle = this.vehicleService.getVehicleById(this.vehicleId);
    }

    forkJoin(requests).subscribe({
      next: (response: any) => {
        const { clients, vehicleBrands, vehicleTypes, devices, drivers, vehicle } = response;
        
        // Cargar solo clientes reales (sin opción "Sin asignar")
        this.clients.set(clients);
        
        // Cargar marcas de vehículos
        this.vehicleBrands.set(vehicleBrands);
        
        // Cargar tipos de vehículos
        this.vehicleTypes.set(vehicleTypes);
        
        // Cargar dispositivos GPS
        this.devices.set(devices);
        
        // Cargar conductores
        this.drivers.set(drivers);
        
        // Si estamos en modo edición, cargar los datos del vehículo
        if (vehicle) {
          this.loadVehicleData(vehicle);
        }
        // En modo creación, el usuario debe seleccionar un cliente manualmente
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
      }
    });
  }

  private loadVehicleData(vehicle: VehicleResponse): void {
    // Actualizar título del wizard
    this.wizardConfig.set({
      title: 'Editar Vehículo',
      icon: 'car-outline',
      totalSteps: 5,
      closable: true
    });

    // 1. Cargar cliente
    const client = this.clients().find(c => c.id === vehicle.clientId);
    if (client) {
      this.selectedClient.set(client);
      this.clientForm.patchValue({ clientId: client.id });
    }

    // 2. Cargar información del vehículo
    this.vehicleInfoForm.patchValue({
      plates: vehicle.plate,
      brand: vehicle.brandName || '',
      model: vehicle.model || '',
      year: vehicle.vehicleYear || '',
      vehicleType: vehicle.vehicleTypeName || ''
    });

    // Pre-seleccionar marca
    if (vehicle.brandId) {
      const brand = this.vehicleBrands().find(b => b.id === vehicle.brandId);
      if (brand) {
        this.selectedBrandId.set(brand.id);
      }
    }

    // Pre-seleccionar tipo de vehículo
    if (vehicle.vehicleTypeCode) {
      const vehicleType = this.vehicleTypes().find(vt => vt.code === vehicle.vehicleTypeCode);
      if (vehicleType) {
        this.selectedVehicleType.set(vehicleType);
      }
    }

    // 3. Cargar dispositivo GPS
    if (vehicle.deviceId) {
      const device = this.devices().find(d => d.id === vehicle.deviceId);
      if (device) {
        this.selectedDevice.set(device);
        this.gpsDeviceForm.patchValue({
          deviceId: device.id,
          imei: device.imei
        });
      }
    }

    // 4. Cargar conductor
    if (vehicle.driverId) {
      const driver = this.drivers().find(d => d.id === vehicle.driverId);
      if (driver) {
        this.selectedDriver.set(driver);
        this.driverForm.patchValue({
          driverId: driver.id,
          driverName: driver.fullName
        });
      }
    }
  }

  private initializeForms(): void {
    this.clientForm = this.fb.group({
      clientId: ['', Validators.required]
    });

    this.vehicleInfoForm = this.fb.group({
      plates: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      vehicleType: ['', Validators.required]
    });

    this.gpsDeviceForm = this.fb.group({
      deviceId: [''],
      imei: ['']
    });

    this.driverForm = this.fb.group({
      driverId: [null],
      driverName: [''],
      driverEmail: [''],
      initialStatus: ['active']
    });
  }

  onClose(): void {
    this.wizardClosed.emit();
  }

  onNext(): void {
    const current = this.currentStep();
    
    if (this.validateCurrentStep()) {
      this.markStepCompleted(current);
      
      if (current < this.steps().length - 1) {
        this.currentStep.set(current + 1);
      } else {
        this.submitVehicle();
      }
    }
  }

  onPrevious(): void {
    const current = this.currentStep();
    if (current > 0) {
      this.currentStep.set(current - 1);
    }
  }

  onStepChange(stepIndex: number): void {
    if (stepIndex < this.currentStep()) {
      this.currentStep.set(stepIndex);
    }
  }


  private validateCurrentStep(): boolean {
    const current = this.currentStep();
    
    switch (current) {
      case 0:
        return this.clientForm.valid && this.selectedClient() !== null;
      case 1:
        return this.vehicleInfoForm.valid;
      case 2:
        return this.gpsDeviceForm.value.deviceId !== '' && this.gpsDeviceForm.value.imei !== '';
      case 3:
        return this.driverForm.valid;
      case 4:
        return true;
      default:
        return false;
    }
  }

  private markStepCompleted(stepIndex: number): void {
    const updatedSteps = this.steps().map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    );
    this.steps.set(updatedSteps);
  }

  onClientSelected(client: Client): void {
    this.selectedClient.set(client);
    this.clientForm.patchValue({
      clientId: client.id
    });
  }

  // Vehicle brand autocomplete methods
  onBrandInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value) {
      const filtered = this.vehicleBrands().filter(brand =>
        brand.name.toLowerCase().includes(value)
      );
      this.filteredBrands.set(filtered);
      this.showBrandList.set(filtered.length > 0);
    } else {
      this.filteredBrands.set(this.vehicleBrands());
      this.showBrandList.set(this.vehicleBrands().length > 0);
    }
  }

  onBrandFocus(): void {
    const currentValue = this.vehicleInfoForm.get('brand')?.value?.toLowerCase() || '';
    if (currentValue) {
      this.onBrandInput({ target: { value: currentValue } });
    } else {
      this.filteredBrands.set(this.vehicleBrands());
      this.showBrandList.set(this.vehicleBrands().length > 0);
    }
  }

  selectBrand(brand: VehicleBrand): void {
    this.vehicleInfoForm.patchValue({
      brand: brand.name
    });
    this.selectedBrandId.set(brand.id);
    this.showBrandList.set(false);
    this.filteredBrands.set([]);
  }

  // Vehicle type autocomplete methods
  onVehicleTypeInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value) {
      const filtered = this.vehicleTypes().filter(type =>
        type.displayName.toLowerCase().includes(value)
      );
      this.filteredVehicleTypes.set(filtered);
      this.showVehicleTypeList.set(filtered.length > 0);
    } else {
      this.filteredVehicleTypes.set(this.vehicleTypes());
      this.showVehicleTypeList.set(this.vehicleTypes().length > 0);
    }
  }

  onVehicleTypeFocus(): void {
    const currentValue = this.vehicleInfoForm.get('vehicleType')?.value?.toLowerCase() || '';
    if (currentValue) {
      this.onVehicleTypeInput({ target: { value: currentValue } });
    } else {
      this.filteredVehicleTypes.set(this.vehicleTypes());
      this.showVehicleTypeList.set(this.vehicleTypes().length > 0);
    }
  }

  selectVehicleType(vehicleType: VehicleType): void {
    this.vehicleInfoForm.patchValue({
      vehicleType: vehicleType.displayName
    });
    this.selectedVehicleType.set(vehicleType);
    this.showVehicleTypeList.set(false);
    this.filteredVehicleTypes.set([]);
  }

  onGpsDeviceSelected(device: DeviceResponse): void {
    this.selectedDevice.set(device);
    this.gpsDeviceForm.patchValue({
      deviceId: device.id,
      imei: device.imei
    });
  }

  onDriverSelected(driver: Driver): void {
    this.selectedDriver.set(driver);
    this.driverForm.patchValue({
      driverId: driver.id,
      driverName: driver.fullName
    });
  }

  private submitVehicle(): void {
    const clientId = this.clientForm.get('clientId')?.value;
    
    const vehiclePayload = {
      clientId: clientId === '00000000-0000-0000-0000-000000000000' ? null : clientId,  // null si es "Sin asignar"
      vehicleBrandId: this.selectedBrandId() || '',  // Enviar el ID de la marca
      plates: this.vehicleInfoForm.get('plates')?.value,
      model: this.vehicleInfoForm.get('model')?.value,
      year: this.vehicleInfoForm.get('year')?.value,
      vehicleTypeCode: this.selectedVehicleType()?.code || '',  // Enviar el código del tipo de vehículo
      deviceId: this.selectedDevice()?.id || null,  // Enviar el ID del dispositivo GPS seleccionado
      driverId: this.selectedDriver()?.id || null  // Enviar el ID del conductor (opcional)
    };
    
    console.log('=== DATOS DEL VEHÍCULO A GUARDAR ===');
    console.log(JSON.stringify(vehiclePayload, null, 2));
    console.log('====================================');
    
    // Emitir evento según el modo (crear o actualizar)
    if (this.vehicleId) {
      console.log('Modo edición - vehicleId:', this.vehicleId);
      this.vehicleUpdated.emit({ id: this.vehicleId, ...vehiclePayload });
    } else {
      console.log('Modo creación');
      this.vehicleCreated.emit(vehiclePayload);
    }
    // No cerrar el wizard aquí - se cerrará desde vehicles.page.ts solo si es exitoso
  }
}
