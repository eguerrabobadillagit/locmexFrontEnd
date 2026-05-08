import { Component, output, input, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon, IonSearchbar, IonSpinner, IonCheckbox } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldOutline, addOutline, searchOutline, pencilOutline,
  trashOutline, notificationsOutline, locationOutline, eyeOutline,
  homeOutline, carOutline, createOutline
} from 'ionicons/icons';
import { GeofenceService } from '../../../geofences/services/geofence.service';
import { GeofenceResponse } from '../../../geofences/interfaces/geofence-request.interface';
import { GeofenceVisibilityService } from '../../../services/geofence-visibility.service';
import { MapAutoTrackingService } from '../../../map/service/map-auto-tracking.service';

type GeofenceFilterTab = 'todas' | 'activas' | 'inactivas';

@Component({
  selector: 'app-geofence-list',
  templateUrl: './geofence-list.component.html',
  styleUrls: ['./geofence-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSearchbar, IonSpinner, IonCheckbox],
})
export class GeofenceListComponent implements OnInit {
  // Inputs
  filterTab = input<GeofenceFilterTab>('todas');
  searchQuery = input<string>('');

  // Outputs
  createGeofence = output<void>();
  viewGeofence = output<GeofenceResponse>();
  editGeofence = output<GeofenceResponse>();
  deleteGeofence = output<GeofenceResponse>();
  filterChange = output<GeofenceFilterTab>();
  searchChange = output<string>();
  geofenceSelectionChange = output<{ geofenceId: string; selected: boolean }>();
  selectAllChange = output<boolean>();
  mobileSidebarClose = output<void>();

  readonly geofenceService = inject(GeofenceService);
  private readonly geofenceVisibilityService = inject(GeofenceVisibilityService);
  private readonly router = inject(Router);
  private readonly autoTrackingService = inject(MapAutoTrackingService);

  // Signal para almacenar IDs de geocercas seleccionadas (local)
  selectedGeofences = signal<Set<string>>(new Set());

  // Signal para almacenar el ID de la geocerca seleccionada (para resaltar)
  selectedGeofenceId = signal<string | null>(null);

  // Computed para conteo
  selectedCount = computed(() => this.selectedGeofences().size);

  private get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  constructor() {
    addIcons({
      shieldOutline, addOutline, searchOutline, pencilOutline,
      trashOutline, notificationsOutline, locationOutline, eyeOutline,
      homeOutline, carOutline, createOutline
    });

    // Efecto para sincronizar con GeofenceVisibilityService
    effect(() => {
      const visibleIds = this.geofenceVisibilityService.selectedGeofenceIds();
      this.selectedGeofences.set(new Set(visibleIds));
    });
  }

  ngOnInit() {
    // Inicializar todas las geocercas como seleccionadas por defecto
    // Usamos un pequeño delay para asegurarnos de que las geocercas ya se cargaron
    setTimeout(() => {
      const allIds = this.filteredGeofences.map(g => g.id);
      if (allIds.length > 0 && this.selectedCount() === 0) {
        this.geofenceVisibilityService.showAll(allIds);
      }
    }, 100);
  }

  get filteredGeofences(): GeofenceResponse[] {
    let geofences = this.geofenceService.geofences();
    const search = this.searchQuery().toLowerCase();
    const filter = this.filterTab();

    if (search) {
      geofences = geofences.filter(g => g.name.toLowerCase().includes(search));
    }

    switch (filter) {
      case 'activas':
        return geofences.filter(g => g.isActive);
      case 'inactivas':
        return geofences.filter(g => !g.isActive);
      default:
        return geofences;
    }
  }

  get activeCount(): number {
    return this.geofenceService.geofences().filter(g => g.isActive).length;
  }

  get totalCount(): number {
    return this.geofenceService.geofences().length;
  }

  onSearch(event: CustomEvent): void {
    this.searchChange.emit(event.detail.value || '');
  }

  onFilterChange(tab: GeofenceFilterTab): void {
    this.filterChange.emit(tab);
    // Al cambiar de tab, seleccionar todas las geocercas filtradas por defecto
    setTimeout(() => {
      const filteredIds = this.filteredGeofences.map(g => g.id);
      if (filteredIds.length > 0) {
        // Mantener las ya seleccionadas y agregar las nuevas filtradas
        const current = new Set(this.geofenceVisibilityService.selectedGeofenceIds());
        filteredIds.forEach(id => current.add(id));
        this.geofenceVisibilityService.setVisibleGeofences(current);
      }
    }, 50);
  }

  onCreate(): void {
    this.createGeofence.emit();
  }

  onView(geofence: GeofenceResponse, event: Event): void {
    event.stopPropagation();
    this.viewGeofence.emit(geofence);

    // En móvil, cerrar el sidebar al ver una geocerca
    if (this.isMobile) {
      this.mobileSidebarClose.emit();
    }
  }

  onEdit(geofence: GeofenceResponse, event: Event): void {
    event.stopPropagation();
    this.editGeofence.emit(geofence);
  }

  onDelete(geofence: GeofenceResponse, event: Event): void {
    event.stopPropagation();
    this.deleteGeofence.emit(geofence);
  }

  getIconColor(geofence: GeofenceResponse): string {
    return geofence.geometryType === 'polygon' ? '#9c27b0' : '#2196f3';
  }

  getTypeLabel(geofence: GeofenceResponse): string {
    return geofence.geometryType === 'polygon' ? 'Polígono' : 'Circular';
  }

  getIconName(geofence: GeofenceResponse): string {
    return geofence.geometryType === 'polygon' ? 'location-outline' : 'shield-outline';
  }

  // Métodos de selección de geocercas (igual que unidades)
  toggleGeofenceSelection(geofenceId: string, event: any) {
    const isSelected = event.detail.checked;

    if (isSelected) {
      this.geofenceVisibilityService.showGeofence(geofenceId);
    } else {
      this.geofenceVisibilityService.hideGeofence(geofenceId);
    }

    this.geofenceSelectionChange.emit({ geofenceId, selected: isSelected });
  }

  toggleSelectAll(event: any) {
    const isSelected = event.detail.checked;

    if (isSelected) {
      // Seleccionar todas las geocercas filtradas actualmente
      const filteredIds = this.filteredGeofences.map(g => g.id);
      this.geofenceVisibilityService.showAll(filteredIds);
    } else {
      // Deseleccionar todas
      this.geofenceVisibilityService.hideAll();
    }

    this.selectAllChange.emit(isSelected);
  }

  isGeofenceSelected(geofenceId: string): boolean {
    return this.geofenceVisibilityService.isVisible(geofenceId);
  }

  // Métodos legacy para compatibilidad (deprecated, usar los nuevos)
  toggleGeofenceVisibility(geofenceId: string, event: any): void {
    this.toggleGeofenceSelection(geofenceId, event);
  }

  isGeofenceVisible(geofenceId: string): boolean {
    return this.isGeofenceSelected(geofenceId);
  }

  showAllGeofences(): void {
    const allIds = this.geofenceService.geofences().map(g => g.id);
    this.geofenceVisibilityService.showAll(allIds);
  }

  hideAllGeofences(): void {
    this.geofenceVisibilityService.hideAll();
  }

  onViewGeofence(geofence: GeofenceResponse): void {
    // Desactivar auto-tracking
    this.autoTrackingService.disableTracking();
    // Centrar el mapa en la geocerca
    this.geofenceService.selectGeofenceToCenter(geofence);
  }

  onCardClick(geofence: GeofenceResponse): void {
    this.selectedGeofenceId.set(geofence.id);
    
    // Desactivar auto-tracking
    this.autoTrackingService.disableTracking();
    
    // Primero navegar a la vista del mapa
    this.router.navigate(['/home/map-view']).then(() => {
      // Esperar un momento para que el mapa se cargue completamente
      setTimeout(() => {
        this.geofenceService.selectGeofenceToCenter(geofence);
      }, 300);
    });

    // En móvil, cerrar el sidebar al hacer click en una geocerca
    if (this.isMobile) {
      this.mobileSidebarClose.emit();
    }
  }
}
