import { Component, Input, Output, EventEmitter, signal, inject, effect, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonModal
} from '@ionic/angular/standalone';
import { FormVehicleWizardComponent } from '../../../vehicles/components/form-vehicle-wizard/form-vehicle-wizard.component';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  arrowBackOutline,
  createOutline,
  locationOutline,
  shareOutline,
  expandOutline,
  speedometerOutline,
  waterOutline,
  compassOutline,
  timeOutline,
  eyeOutline,
  informationCircleOutline,
  warningOutline,
  chevronUpOutline,
  chevronDownOutline
} from 'ionicons/icons';
import { VehicleDetail } from '../../../map/interfaces/vehicle-detail.interface';
import { StreetViewComponent } from '../street-view/street-view.component';
import { GeocodingService } from '../../../map/service/geocoding.service';
import { VehicleAlertsComponent } from '../vehicle-alerts/vehicle-alerts.component';
import { GenerateLinkModalComponent } from '../../../public-tracking/components/generate-link-modal/generate-link-modal.component';

@Component({
  selector: 'app-vehicle-detail-mobile',
  templateUrl: './vehicle-detail-mobile.component.html',
  styleUrls: ['./vehicle-detail-mobile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonModal,
    VehicleAlertsComponent,
    GenerateLinkModalComponent,
    StreetViewComponent,
    FormVehicleWizardComponent
  ]
})
export class VehicleDetailMobileComponent {
  private geocodingService = inject(GeocodingService);

  @Input() vehicle!: VehicleDetail;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() locate = new EventEmitter<void>();
  @Output() expand = new EventEmitter<void>();
  @Output() openStreetViewFullscreen = new EventEmitter<VehicleDetail>();

  showStreetView = signal<boolean>(false);
  address = signal<string>('Cargando ubicación...');
  showShareModal = signal<boolean>(false);
  activeSegment: 'info' | 'alertas' | 'comandos' = 'info';
  showEditWizard = signal<boolean>(false);
  
  // Estado del sheet (expandido/colapsado)
  isExpanded = signal<boolean>(false);

  // Variables para el drag
  private startY = 0;
  private startHeight = 0;
  private currentHeight = 0;
  private isDragging = false;
  private readonly COLLAPSED_HEIGHT = 280;
  private readonly EXPANDED_HEIGHT = window.innerHeight * 0.85;

  constructor() {
    addIcons({
      closeOutline,
      arrowBackOutline,
      createOutline,
      locationOutline,
      shareOutline,
      expandOutline,
      speedometerOutline,
      waterOutline,
      compassOutline,
      timeOutline,
      eyeOutline,
      informationCircleOutline,
      warningOutline,
      chevronUpOutline,
      chevronDownOutline
    });

    effect(() => {
      if (this.vehicle && this.vehicle.latitude && this.vehicle.longitude) {
        this.loadAddress(this.vehicle.latitude, this.vehicle.longitude);
      } else {
        this.address.set('Ubicación no disponible');
      }
    });
  }

  private async loadAddress(lat: number, lng: number): Promise<void> {
    if (lat === 0 && lng === 0) {
      this.address.set('Sin ubicación GPS');
      return;
    }

    try {
      const result = await this.geocodingService.getAddressFromCoordinates(lat, lng);
      if (result) {
        this.address.set(result.formattedAddress);
      } else {
        this.address.set('Ubicación disponible en el mapa');
      }
    } catch (error) {
      this.address.set('Ubicación disponible en el mapa');
    }
  }

  onSegmentChange(value: 'info' | 'alertas' | 'comandos'): void {
    this.activeSegment = value;
  }

  onClose() {
    this.close.emit();
  }

  onBack() {
    this.close.emit();
  }

  onEdit() {
    this.showEditWizard.set(true);
  }

  onWizardClose() {
    this.showEditWizard.set(false);
  }

  onVehicleUpdated(_data: any) {
    this.showEditWizard.set(false);
  }

  onLocate() {
    this.locate.emit();
  }

  onShare() {
    this.showShareModal.set(true);
  }

  onCloseShareModal() {
    this.showShareModal.set(false);
  }

  onExpand() {
    this.expand.emit();
  }

  onMonitorImage() {
    this.showStreetView.set(true);
  }

  onStreetViewFullscreen() {
    if (this.vehicle) this.openStreetViewFullscreen.emit(this.vehicle);
  }

  onCloseStreetView() {
    this.showStreetView.set(false);
  }

  toggleSheet() {
    this.isExpanded.set(!this.isExpanded());
  }

  getStatusClass(): string {
    if (!this.vehicle) return '';

    if (this.vehicle.status === 'In_route') return 'status-in-route';
    if (this.vehicle.status === 'Stopped') return 'status-stopped';
    return 'status-no-signal';
  }

  getStatusText(): string {
    if (!this.vehicle) return '';

    if (this.vehicle.status === 'In_route') return 'En ruta';
    if (this.vehicle.status === 'Stopped') return 'Detenido';
    return 'Sin señal';
  }

  // Drag handlers
  onDragStart(event: TouchEvent | MouseEvent) {
    this.isDragging = true;
    this.startY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.startHeight = this.isExpanded() ? this.EXPANDED_HEIGHT : this.COLLAPSED_HEIGHT;

    // Prevenir selección de texto durante el drag
    document.body.style.userSelect = 'none';
  }

  onDragMove(event: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;

    const currentY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaY = this.startY - currentY;
    this.currentHeight = Math.max(
      this.COLLAPSED_HEIGHT,
      Math.min(this.EXPANDED_HEIGHT, this.startHeight + deltaY)
    );

    // Aplicar altura directamente al elemento
    const container = document.querySelector('.vehicle-detail-mobile-container') as HTMLElement;
    if (container) {
      container.style.maxHeight = `${this.currentHeight}px`;
      container.style.transition = 'none';
    }
  }

  onDragEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.userSelect = '';

    // Determinar si expandir o colapsar basado en la posición actual
    const threshold = (this.COLLAPSED_HEIGHT + this.EXPANDED_HEIGHT) / 2;

    if (this.currentHeight > threshold) {
      this.isExpanded.set(true);
    } else {
      this.isExpanded.set(false);
    }

    // Restaurar transición
    const container = document.querySelector('.vehicle-detail-mobile-container') as HTMLElement;
    if (container) {
      container.style.transition = '';
      container.style.maxHeight = '';
    }
  }

  @HostListener('document:touchmove', ['$event'])
  @HostListener('document:mousemove', ['$event'])
  handleGlobalMove(event: TouchEvent | MouseEvent) {
    if (this.isDragging) {
      event.preventDefault();
      this.onDragMove(event);
    }
  }

  @HostListener('document:touchend')
  @HostListener('document:mouseup')
  handleGlobalEnd() {
    this.onDragEnd();
  }

  onCommandClick(command: string): void {
    console.log('Comando seleccionado:', command);
    // TODO: Implementar lógica de envío de comandos al dispositivo
  }
}
