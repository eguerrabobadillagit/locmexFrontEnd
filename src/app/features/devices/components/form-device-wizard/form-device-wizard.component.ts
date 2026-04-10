import { Component, OnInit, signal, output, computed, inject, input, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ColDef } from 'ag-grid-community';
import { forkJoin } from 'rxjs';
import { WizardStepperComponent } from '../../../../core/components/wizard-stepper/wizard-stepper.component';
import { WizardConfig, WizardStep } from '../../../../core/interfaces/wizard.interface';
import { ModalSearchableGridComponent } from '../../../../core/components/modal-searchable-grid/modal-searchable-grid.component';
import { WizardConfirmationSummaryComponent, ConfirmationSection } from '../../../../core/components/wizard-confirmation-summary/wizard-confirmation-summary.component';
import { TelemetryCapability } from '../../interfaces/device.model';
import { DeviceService } from '../../services/device.service';
import { CatalogService } from '../../services/catalog.service';
import { ClientService } from '../../services/client.service';
import { CreateDeviceRequest, UpdateDeviceRequest } from '../../interfaces/device-request.interface';
import { Client } from '../../interfaces/client.interface';
import { getClientColumnDefs } from '../../utils/client-grid-columns.util';
import { Manufacturer, MOCK_MANUFACTURERS } from '../../data/manufacturers.mock';
import { DeviceBrand, DeviceModel, SimCarrier } from '../../interfaces/catalog.interface';

@Component({
  selector: 'app-form-device-wizard',
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    WizardStepperComponent,
    ModalSearchableGridComponent,
    WizardConfirmationSummaryComponent
  ],
  templateUrl: './form-device-wizard.component.html',
  styleUrls: ['./form-device-wizard.component.scss']
})
export class FormDeviceWizardComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly catalogService = inject(CatalogService);
  private readonly clientService = inject(ClientService);
  
  // Input para modo edición
  deviceId = input<string | null>(null);
  
  deviceSubmitted = output<any>();
  wizardCancelled = output<void>();

  currentStep = signal(0);
  isEditMode = computed(() => this.deviceId() !== null);
  totalSteps = 3;
  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  
  // Client selection
  clients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);

  // Manufacturer autocomplete
  deviceBrands = signal<DeviceBrand[]>([]);
  filteredManufacturers = signal<DeviceBrand[]>([]);
  showManufacturerList = signal<boolean>(false);
  selectedBrandId = signal<string | null>(null);

  // Device models (dependent on selected brand)
  deviceModels = signal<DeviceModel[]>([]);
  filteredModels = signal<DeviceModel[]>([]);
  showModelList = signal<boolean>(false);
  selectedModelId = signal<string | null>(null);

  // SIM carriers autocomplete
  simCarriers = signal<SimCarrier[]>([]);
  filteredCarriers = signal<SimCarrier[]>([]);
  showCarrierList = signal<boolean>(false);
  selectedCarrierCode = signal<string | null>(null);

  wizardConfig = computed<WizardConfig>(() => ({
    title: this.isEditMode() ? 'Editar Dispositivo GPS' : 'Agregar Dispositivo GPS',
    icon: 'hardware-chip-outline',
    totalSteps: 3,
    closable: true
  }));

  steps = signal<WizardStep[]>([
    { id: 'client-assignment', label: 'Asignación', icon: 'person-outline', completed: false },
    { id: 'device-info', label: 'Información', icon: 'information-circle-outline', completed: false },
    { id: 'confirmation', label: 'Confirmación', icon: 'checkmark-done-outline', completed: false }
  ]);

  // Form Groups
  clientForm: FormGroup;
  deviceInfoForm: FormGroup;

  // AG Grid column definitions for clients (computed para actualizar cuando cambie la selección)
  clientColumnDefs = computed<ColDef[]>(() => 
    getClientColumnDefs(this.selectedClient()?.id)
  );

  constructor(private formBuilder: FormBuilder) {
    this.clientForm = this.formBuilder.group({
      clientId: ['', Validators.required]
    });
    
    this.deviceInfoForm = this.formBuilder.group({
      imei: ['', Validators.required],
      alias: [''],
      manufacturer: ['', Validators.required],
      model: ['', Validators.required],
      protocol: ['', Validators.required],
      tcpPort: ['', [Validators.required, Validators.min(1), Validators.max(65535)]],
      simNumber: ['', Validators.required],
      phoneCompany: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar todas las listas necesarias primero
    forkJoin({
      brands: this.catalogService.getDeviceBrands(),
      clients: this.clientService.getClients(),
      carriers: this.catalogService.getSimCarriers()
    }).subscribe({
      next: ({ brands, clients, carriers }) => {
        this.deviceBrands.set(brands);
        
        // Agregar opción "Sin asignar" al inicio de la lista de clientes
        const unassignedClient: Client = {
          id: '00000000-0000-0000-0000-000000000000',
          tenantId: '00000000-0000-0000-0000-000000000000',
          name: 'Sin asignar cliente (asignar después)',
          contactName: '-',
          contactPhone: '-',
          contactEmail: '-',
          externalCode: '-',
          isActive: true,
          createdAtUtc: new Date().toISOString()
        };
        this.clients.set([unassignedClient, ...clients]);
        
        this.simCarriers.set(carriers);
        
        // Ahora que las listas están cargadas, cargar los datos del dispositivo si estamos en modo edición
        const deviceId = this.deviceId();
        if (deviceId) {
          this.loadDeviceData(deviceId);
        } else {
          // Si no estamos en modo edición, seleccionar "Sin asignar" por defecto
          this.selectedClient.set(unassignedClient);
          this.clientForm.patchValue({ clientId: unassignedClient.id });
        }
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
      }
    });
  }

  private loadDeviceModels(brandId: string): void {
    this.catalogService.getDeviceModels(brandId).subscribe({
      next: (models) => {
        this.deviceModels.set(models);
      },
      error: (err) => {
        console.error('Error al cargar modelos de dispositivos:', err);
        this.deviceModels.set([]);
      }
    });
  }

  private loadDeviceData(deviceId: string): void {
    this.deviceService.getDeviceById(deviceId).subscribe({
      next: (device) => {
        // Cargar datos en el formulario de dispositivo
        this.deviceInfoForm.patchValue({
          imei: device.imei,
          alias: device.alias,
          manufacturer: device.brandName,
          model: device.modelName,
          protocol: device.protocol,
          simNumber: device.simPhoneNumber,
          phoneCompany: device.simCarrierCode
        });

        // Guardar los IDs seleccionados
        this.selectedModelId.set(device.deviceModelId);
        this.selectedCarrierCode.set(device.simCarrierCode);

        // Cargar y seleccionar el cliente asociado
        if (device.clientId) {
          this.clientForm.patchValue({ clientId: device.clientId });
          
          // Buscar el cliente en la lista de clientes y seleccionarlo
          const client = this.clients().find(c => c.id === device.clientId);
          if (client) {
            this.selectedClient.set(client);
          }
        } else {
          // Si no tiene cliente asignado, seleccionar "Sin asignar"
          const unassignedClient = this.clients().find(c => c.id === '00000000-0000-0000-0000-000000000000');
          if (unassignedClient) {
            this.selectedClient.set(unassignedClient);
            this.clientForm.patchValue({ clientId: unassignedClient.id });
          }
        }

        // Cargar los modelos de la marca seleccionada
        const brand = this.deviceBrands().find(b => b.name === device.brandName);
        if (brand) {
          this.selectedBrandId.set(brand.id);
          this.loadDeviceModels(brand.id);
          
          // Después de cargar los modelos, buscar el modelo específico y llenar el puerto TCP
          this.catalogService.getDeviceModels(brand.id).subscribe({
            next: (models) => {
              const selectedModel = models.find(m => m.id === device.deviceModelId);
              if (selectedModel) {
                this.deviceInfoForm.patchValue({
                  tcpPort: selectedModel.defaultPort
                });
              }
            }
          });
        }

        // Buscar la compañía telefónica y mostrar su displayName
        const carrier = this.simCarriers().find(c => c.code === device.simCarrierCode);
        if (carrier) {
          this.deviceInfoForm.patchValue({
            phoneCompany: carrier.displayName
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar dispositivo:', err);
      }
    });
  }

  // Computed confirmation sections
  confirmationSections = computed<ConfirmationSection[]>(() => {
    const sections: ConfirmationSection[] = [];

    // Sección 1: Cliente Asignado
    const client = this.selectedClient();
    if (client) {
      sections.push({
        icon: 'person-outline',
        iconColor: '#3b82f6',
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
        title: 'Cliente Asignado',
        subtitle: 'Cliente al que pertenecerá este recurso',
        fields: [
          { label: 'Nombre', value: client.name },
          { label: 'Contacto', value: client.contactName },
          { label: 'Correo', value: client.contactEmail },
          { label: 'Código', value: client.externalCode }
        ]
      });
    }

    // Sección 2: Información del Dispositivo
    sections.push({
      icon: 'hardware-chip',
      iconColor: '#3b82f6',
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      title: 'Información del Dispositivo',
      subtitle: 'Datos básicos del dispositivo GPS',
      fields: [
        { label: 'IMEI', value: this.deviceInfoForm.get('imei')?.value || '-' },
        { label: 'Alias', value: this.deviceInfoForm.get('alias')?.value || 'Sin alias' },
        { label: 'Fabricante', value: this.deviceInfoForm.get('manufacturer')?.value || '-' },
        { label: 'Modelo', value: this.deviceInfoForm.get('model')?.value || '-' },
        { label: 'Protocolo', value: this.deviceInfoForm.get('protocol')?.value || '-' },
        { label: 'Puerto TCP', value: this.deviceInfoForm.get('tcpPort')?.value || '-' },
        { label: 'SIM', value: this.deviceInfoForm.get('simNumber')?.value || '-' },
        { label: 'Compañía', value: this.deviceInfoForm.get('phoneCompany')?.value || '-' }
      ]
    });

    return sections;
  });

  onClientSelect(client: Client): void {
    this.selectedClient.set(client);
    this.clientForm.patchValue({ clientId: client.id });
  }

  onManufacturerInput(event: any): void {
    const value = event.target.value.toLowerCase();
    
    if (!value) {
      this.filteredManufacturers.set([]);
      this.showManufacturerList.set(false);
      return;
    }

    const filtered = this.deviceBrands().filter((m: DeviceBrand) => 
      m.name.toLowerCase().includes(value)
    );
    
    this.filteredManufacturers.set(filtered);
    this.showManufacturerList.set(filtered.length > 0);
  }

  onManufacturerFocus(): void {
    const currentValue = this.deviceInfoForm.get('manufacturer')?.value?.toLowerCase() || '';
    if (currentValue) {
      this.onManufacturerInput({ target: { value: currentValue } });
    } else {
      // Mostrar todas las opciones cuando el campo está vacío
      this.filteredManufacturers.set(this.deviceBrands());
      this.showManufacturerList.set(this.deviceBrands().length > 0);
    }
  }

  selectManufacturer(manufacturer: DeviceBrand): void {
    this.deviceInfoForm.patchValue({ 
      manufacturer: manufacturer.name,
      model: '',  // Limpiar el modelo cuando cambie la marca
      protocol: ''  // Limpiar el protocolo cuando cambie la marca
    });
    this.showManufacturerList.set(false);
    this.filteredManufacturers.set([]);
    
    // Guardar el brandId y cargar los modelos
    this.selectedBrandId.set(manufacturer.id);
    this.loadDeviceModels(manufacturer.id);
  }

  onModelInput(event: any): void {
    const value = event.target.value.toLowerCase();
    
    if (!value) {
      this.filteredModels.set([]);
      this.showModelList.set(false);
      return;
    }

    const filtered = this.deviceModels().filter((m: DeviceModel) => 
      m.name.toLowerCase().includes(value)
    );
    
    this.filteredModels.set(filtered);
    this.showModelList.set(filtered.length > 0);
  }

  onModelFocus(): void {
    const currentValue = this.deviceInfoForm.get('model')?.value?.toLowerCase() || '';
    if (currentValue) {
      this.onModelInput({ target: { value: currentValue } });
    } else {
      // Mostrar todas las opciones cuando el campo está vacío
      this.filteredModels.set(this.deviceModels());
      this.showModelList.set(this.deviceModels().length > 0);
    }
  }

  selectModel(model: DeviceModel): void {
    this.deviceInfoForm.patchValue({ 
      model: model.name,
      protocol: model.protocolCode,  // Auto-llenar el protocolo desde el modelo
      tcpPort: model.defaultPort  // Auto-llenar el puerto TCP desde el modelo
    });
    
    this.selectedModelId.set(model.id);  // Guardar el ID del modelo para enviar al API
    this.showModelList.set(false);
    this.filteredModels.set([]);
  }

  onCarrierInput(event: any): void {
    const value = event.target.value.toLowerCase();
    
    if (!value) {
      this.filteredCarriers.set([]);
      this.showCarrierList.set(false);
      return;
    }

    const filtered = this.simCarriers().filter((carrier: SimCarrier) => 
      carrier.displayName.toLowerCase().includes(value)
    );
    
    this.filteredCarriers.set(filtered);
    this.showCarrierList.set(filtered.length > 0);
  }

  onCarrierFocus(): void {
    const currentValue = this.deviceInfoForm.get('phoneCompany')?.value?.toLowerCase() || '';
    if (currentValue) {
      this.onCarrierInput({ target: { value: currentValue } });
    } else {
      // Mostrar todas las opciones cuando el campo está vacío
      this.filteredCarriers.set(this.simCarriers());
      this.showCarrierList.set(this.simCarriers().length > 0);
    }
  }

  selectCarrier(carrier: SimCarrier): void {
    this.deviceInfoForm.patchValue({ 
      phoneCompany: carrier.displayName  // Mostrar el nombre en el input
    });
    
    this.selectedCarrierCode.set(carrier.code);  // Guardar el código para enviar al API
    this.showCarrierList.set(false);
    this.filteredCarriers.set([]);
  }

  nextStep(): void {
    if (this.canProceed()) {
      if (this.currentStep() === this.totalSteps - 1) {
        this.submitDevice();
      } else {
        this.currentStep.update(step => Math.min(step + 1, this.totalSteps - 1));
      }
    }
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 0));
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 0:
        return this.clientForm.valid && this.selectedClient() !== null;
      case 1:
        return this.deviceInfoForm.valid;
      case 2:
        return true;
      default:
        return false;
    }
  }


  submitDevice(): void {
    this.isSubmitting.set(true);
    this.submitError.set(null);

    const clientId = this.clientForm.get('clientId')?.value;
    const deviceData = {
      imei: this.deviceInfoForm.get('imei')?.value,
      clientId: clientId === '00000000-0000-0000-0000-000000000000' ? null : clientId,  // null si es "Sin asignar"
      protocol: this.deviceInfoForm.get('protocol')?.value,
      deviceModelId: this.selectedModelId() || '',  // Enviar el ID del modelo
      simPhoneNumber: this.deviceInfoForm.get('simNumber')?.value,
      simCarrierCode: this.selectedCarrierCode() || '',
      alias: this.deviceInfoForm.get('alias')?.value || '',
      isActive: true
    };

    // Determinar si es creación o actualización
    if (this.isEditMode() && this.deviceId()) {
      // Modo edición - usar PUT
      const updateRequest: UpdateDeviceRequest = deviceData;
      
      this.deviceService.updateDevice(this.deviceId()!, updateRequest).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.deviceSubmitted.emit(response);
        },
        error: (error) => {
          console.error('Error al actualizar dispositivo:', error);
          this.isSubmitting.set(false);
          this.submitError.set(error.message || 'Error al actualizar el dispositivo. Por favor, intenta nuevamente.');
        }
      });
    } else {
      // Modo creación - usar POST
      const createRequest: CreateDeviceRequest = deviceData;
      
      this.deviceService.createDevice(createRequest).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.deviceSubmitted.emit(response);
        },
        error: (error) => {
          console.error('Error al crear dispositivo:', error);
          this.isSubmitting.set(false);
          this.submitError.set(error.message || 'Error al crear el dispositivo. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  cancel(): void {
    this.wizardCancelled.emit();
  }
}
