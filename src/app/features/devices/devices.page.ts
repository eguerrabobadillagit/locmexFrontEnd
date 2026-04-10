import { Component, signal, OnInit, AfterViewInit, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-enterprise';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { PageHeaderComponent } from '../../core/components/page-header/page-header.component';
import { DataToolbarComponent } from '../../core/components/data-toolbar/data-toolbar.component';
import { FormDeviceWizardComponent } from './components/form-device-wizard/form-device-wizard.component';
import { IFilterOption } from '../../core/models/filter-option.interface';
import { Device } from './interfaces/device.model';
import { deviceColumnDefs } from './utils/column-definitions.util';
import { deviceFilterOptions, deviceGridOptions } from './utils/grid-config.util';
import { mockDevices } from './mock/mock-data';
import { DeviceService } from './services/device.service';
import { CreateDeviceResponse, DeviceResponse } from './interfaces/device-response.interface';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    IonicModule,
    PageHeaderComponent,
    DataToolbarComponent,
    AgGridAngular,
    FormDeviceWizardComponent
  ],
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage implements OnInit, AfterViewInit {
  private readonly deviceService = inject(DeviceService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);
  
  devices = signal<DeviceResponse[]>([]);
  filteredDevices = signal<DeviceResponse[]>([]);
  quickFilterText = signal<string>('');
  showDeviceWizard = signal<boolean>(false);
  editingDeviceId = signal<string | null>(null);

  columnDefs: ColDef<any>[] = deviceColumnDefs;
  gridOptions: GridOptions = {
    ...deviceGridOptions,
    onRowDoubleClicked: (event) => {
      if (event.data && event.data.id) {
        this.onEditDevice(event.data.id);
      }
    }
  };
  filterOptions: IFilterOption[] = deviceFilterOptions;

  ngOnInit(): void {
    this.loadDevices();
  }

  ngAfterViewInit(): void {
    // Agregar event listeners para los botones de acción en la grilla
    setTimeout(() => {
      this.setupGridActionListeners();
    }, 500);
  }

  private setupGridActionListeners(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Click en botón editar
      if (target.closest('.edit-btn')) {
        const button = target.closest('.edit-btn') as HTMLElement;
        const deviceId = button.getAttribute('data-id');
        if (deviceId) {
          this.onEditDevice(deviceId);
        }
      }
      
      // Click en botón eliminar
      if (target.closest('.delete-btn')) {
        const button = target.closest('.delete-btn') as HTMLElement;
        const deviceId = button.getAttribute('data-id');
        if (deviceId) {
          this.onDeleteDevice(deviceId);
        }
      }
    });
  }

  private loadDevices(): void {
    this.deviceService.getDevices().subscribe({
      next: (devices) => {
        this.devices.set(devices);
        this.filteredDevices.set(devices);
      },
      error: async (error) => {
        console.error('Error al cargar dispositivos:', error);
        await this.presentToast('Error al cargar dispositivos', 'danger');
      }
    });
  }

  onSearch(searchText: string): void {
    this.quickFilterText.set(searchText);
    this.applyFilters();
  }

  onFilterChange(filterValue: string | number): void {
    this.applyFilters(filterValue.toString());
  }

  private applyFilters(statusFilter: string = 'all'): void {
    let filtered = [...this.devices()];

    if (this.quickFilterText()) {
      const searchLower = this.quickFilterText().toLowerCase();
      filtered = filtered.filter(device =>
        device.imei.toLowerCase().includes(searchLower) ||
        device.modelName.toLowerCase().includes(searchLower) ||
        device.alias.toLowerCase().includes(searchLower) ||
        device.protocol.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(device => device.isActive === true);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(device => device.isActive === false);
      } else {
        filtered = filtered.filter(device => device.protocol === statusFilter);
      }
    }

    this.filteredDevices.set(filtered);
  }

  onAddDevice(): void {
    this.editingDeviceId.set(null);
    this.showDeviceWizard.set(true);
  }

  onEditDevice(deviceId: string): void {
    this.editingDeviceId.set(deviceId);
    this.showDeviceWizard.set(true);
  }

  onWizardClose(): void {
    this.showDeviceWizard.set(false);
    this.editingDeviceId.set(null);
  }

  async onDeviceCreated(deviceData: CreateDeviceResponse): Promise<void> {
    this.showDeviceWizard.set(false);
    
    await this.presentToast('Dispositivo creado exitosamente', 'success');
    
    this.loadDevices();
  }

  private async presentToast(message: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  async onDeleteDevice(deviceId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este dispositivo? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(deviceId);
          }
        }
      ]
    });

    await alert.present();
  }

  private confirmDelete(deviceId: string): void {
    this.deviceService.deleteDevice(deviceId).subscribe({
      next: async () => {
        await this.presentToast('Dispositivo eliminado exitosamente', 'success');
        this.loadDevices();
      },
      error: async (error) => {
        console.error('Error al eliminar dispositivo:', error);
        await this.presentToast('Error al eliminar el dispositivo', 'danger');
      }
    });
  }

  onViewChange(view: 'list' | 'grid'): void {
    // TODO: Implementar cambio de vista
  }
}
