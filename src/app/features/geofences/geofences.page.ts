import { Component, OnInit, signal, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-enterprise';
import { PageHeaderComponent } from '../../core/components/page-header/page-header.component';
import { DataToolbarComponent } from '../../core/components/data-toolbar/data-toolbar.component';
import { IFilterOption } from '../../core/models/filter-option.interface';
import { GeofenceService } from './services/geofence.service';
import { GeofenceResponse } from './interfaces/geofence-request.interface';
import { geofenceColumnDefs, geofenceFilterOptions, geofenceGridOptions } from './config/geofence-grid.config';
import { GeofenceMapComponent } from './components/geofence-map/geofence-map.component';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-geofences',
  standalone: true,
  imports: [
    IonicModule,
    PageHeaderComponent,
    DataToolbarComponent,
    AgGridAngular,
    GeofenceMapComponent
  ],
  templateUrl: './geofences.page.html',
  styleUrls: ['./geofences.page.scss']
})
export class GeofencesPage implements OnInit {
  private readonly geofenceService = inject(GeofenceService);
  private readonly toastService = inject(NgToastService);
  private readonly alertController = inject(AlertController);

  // UI state signals
  filteredGeofences = signal<GeofenceResponse[]>([]);
  quickFilterText = signal<string>('');
  currentFilter = signal<string>('all');
  showMapComponent = signal<boolean>(false);
  geofenceToEdit = signal<GeofenceResponse | null>(null);
  
  filterOptions: IFilterOption[] = geofenceFilterOptions;
  columnDefs: ColDef[] = geofenceColumnDefs;
  gridOptions: GridOptions = geofenceGridOptions;

  ngOnInit(): void {
    this.loadGeofences();
    this.setupGridEventListeners();
  }

  setupGridEventListeners(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      document.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        
        // Handle edit button click
        const editButton = target.closest('[data-geofence-id]');
        if (editButton && editButton.classList.contains('edit-btn')) {
          const geofenceId = editButton.getAttribute('data-geofence-id');
          if (geofenceId) {
            this.onEditGeofence(geofenceId);
          }
        }
        
        // Handle delete button click
        const deleteButton = target.closest('[data-geofence-id]');
        if (deleteButton && deleteButton.classList.contains('delete-btn')) {
          const geofenceId = deleteButton.getAttribute('data-geofence-id');
          if (geofenceId) {
            this.onDeleteGeofence(geofenceId);
          }
        }
      });
    }, 100);
  }

  loadGeofences(): void {
    this.geofenceService.getGeofences().subscribe({
      next: () => {
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error al cargar geocercas:', error);
      }
    });
  }

  onCreateGeofence(): void {
    this.geofenceToEdit.set(null);
    this.showMapComponent.set(true);
  }

  onEditGeofence(geofenceId: string): void {
    const geofence = this.geofenceService.geofences().find(g => g.id === geofenceId);
    if (geofence) {
      this.geofenceToEdit.set(geofence);
      this.showMapComponent.set(true);
    }
  }

  async onDeleteGeofence(geofenceId: string): Promise<void> {
    const geofence = this.geofenceService.geofences().find(g => g.id === geofenceId);
    if (!geofence) return;

    // Show Ionic alert for confirmation
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la geocerca "${geofence.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: () => {
            // User confirmed, proceed with deletion
            this.geofenceService.deleteGeofence(geofenceId).subscribe({
              next: () => {
                console.log('Geocerca eliminada exitosamente');
                this.toastService.success('Geocerca eliminada exitosamente', 'Éxito');
                this.loadGeofences();
              },
              error: (error) => {
                console.error('Error al eliminar geocerca:', error);
                this.toastService.danger('Error al eliminar la geocerca: ' + (error.message || 'Error desconocido'), 'Error');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  onMapClose(): void {
    this.showMapComponent.set(false);
    this.loadGeofences();
  }

  onFilterChange(filter: string | number): void {
    this.currentFilter.set(String(filter));
    this.applyFilters();
  }

  onSearch(searchText: string): void {
    this.quickFilterText.set(searchText);
  }

  applyFilters(): void {
    let filtered = this.geofenceService.geofences();

    // Apply status filter
    if (this.currentFilter() !== 'all') {
      filtered = filtered.filter((g: GeofenceResponse) => {
        const status = g.isActive ? 'active' : 'inactive';
        return status === this.currentFilter();
      });
    }

    this.filteredGeofences.set(filtered);
  }
}
