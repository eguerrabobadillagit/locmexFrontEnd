import { Component, AfterViewInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { PageHeaderComponent } from '../../core/components/page-header/page-header.component';
import { DataToolbarComponent } from '../../core/components/data-toolbar/data-toolbar.component';
import { IFilterOption } from '../../core/models/filter-option.interface';
import { FormClientWizardComponent } from './components/form-client-wizard/form-client-wizard.component';
import { clientColumnDefs } from './utils/column-definitions.util';
import { clientFilterOptions, clientGridOptions } from './utils/grid-config.util';
import { ClientService } from './services/client.service';
import { CreateClientRequest, ClientResponse } from './interfaces/client-request.interface';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    AgGridAngular,
    PageHeaderComponent,
    DataToolbarComponent,
    FormClientWizardComponent
  ],
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss']
})
export class ClientsPage implements AfterViewInit {
  private readonly clientService = inject(ClientService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  @ViewChild('clientWizard') clientWizard?: FormClientWizardComponent;

  clients = signal<ClientResponse[]>([]);
  filteredClients = signal<ClientResponse[]>([]);
  quickFilterText = signal<string>('');
  showClientWizard = signal<boolean>(false);
  selectedClientId = signal<string | undefined>(undefined);
  
  filterOptions: IFilterOption[] = clientFilterOptions;
  columnDefs: ColDef[] = clientColumnDefs;
  gridOptions: GridOptions = clientGridOptions;

  constructor() {
    this.loadClients();
  }

  ngAfterViewInit(): void {
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      gridContainer.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          const button = target.classList.contains('edit-btn') ? target : target.closest('.edit-btn');
          const clientId = button?.getAttribute('data-id');
          if (clientId) {
            this.onEditClient(clientId);
          }
        }
        
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
          const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
          const clientId = button?.getAttribute('data-id');
          if (clientId) {
            this.onDeleteClient(clientId);
          }
        }
      });
    }
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.filteredClients.set(clients);
        this.updateFilterCounts(clients);
      },
      error: async (err) => {
        console.error('Error loading clients:', err);
        const toast = await this.toastController.create({
          message: 'Error al cargar los clientes',
          duration: 3000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
      }
    });
  }

  onGridReady(params: GridReadyEvent): void {
    params.api.sizeColumnsToFit();
  }

  onQuickFilterChange(filterText: string): void {
    this.quickFilterText.set(filterText);
  }

  onFilterChange(filterValue: string | number): void {
    const allClients = this.clients();
    
    if (filterValue === 'all') {
      this.filteredClients.set(allClients);
    } else if (filterValue === 'active') {
      const filtered = allClients.filter(client => client.isActive === true);
      this.filteredClients.set(filtered);
    } else if (filterValue === 'inactive') {
      const filtered = allClients.filter(client => client.isActive === false);
      this.filteredClients.set(filtered);
    }
  }

  onCreateClient(): void {
    this.selectedClientId.set(undefined);
    this.showClientWizard.set(true);
  }

  onEditClient(clientId: string): void {
    this.selectedClientId.set(clientId);
    this.showClientWizard.set(true);
  }

  async onDeleteClient(clientId: string): Promise<void> {
    const client = this.clients().find(c => c.id === clientId);
    if (!client) return;

    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      message: `¿Estás seguro de eliminar al cliente "${client.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: () => {
            this.deleteClientConfirmed(clientId);
          }
        }
      ]
    });

    await alert.present();
  }

  private deleteClientConfirmed(clientId: string): void {
    this.clientService.deleteClient(clientId).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Cliente eliminado exitosamente',
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();
        this.loadClients();
      },
      error: async (err) => {
        console.error('Error deleting client:', err);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el cliente',
          duration: 3000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
      }
    });
  }

  onClientCreated(clientData: CreateClientRequest): void {
    const clientId = this.selectedClientId();

    if (clientId) {
      this.clientService.updateClient(clientId, clientData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Cliente actualizado exitosamente',
            duration: 3000,
            position: 'top',
            color: 'success',
            icon: 'checkmark-circle'
          });
          await toast.present();
          this.loadClients();
          this.showClientWizard.set(false);
        },
        error: async (err) => {
          console.error('Error updating client:', err);
          this.clientWizard?.resetSubmitting();
          const toast = await this.toastController.create({
            message: err.error?.message || 'Error al actualizar el cliente',
            duration: 3000,
            position: 'top',
            color: 'danger',
            icon: 'alert-circle'
          });
          await toast.present();
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Cliente creado exitosamente',
            duration: 3000,
            position: 'top',
            color: 'success',
            icon: 'checkmark-circle'
          });
          await toast.present();
          this.loadClients();
          this.showClientWizard.set(false);
        },
        error: async (err) => {
          console.error('Error creating client:', err);
          this.clientWizard?.resetSubmitting();
          const toast = await this.toastController.create({
            message: err.error?.message || 'Error al crear el cliente',
            duration: 3000,
            position: 'top',
            color: 'danger',
            icon: 'alert-circle'
          });
          await toast.present();
        }
      });
    }
  }

  onWizardClose(): void {
    this.showClientWizard.set(false);
    this.selectedClientId.set(undefined);
  }

  private updateFilterCounts(clients: ClientResponse[]): void {
    this.filterOptions = [
      {
        label: 'Todos',
        value: 'all'
      },
      {
        label: 'Activos',
        value: 'active'
      },
      {
        label: 'Inactivos',
        value: 'inactive'
      }
    ];
  }
}
