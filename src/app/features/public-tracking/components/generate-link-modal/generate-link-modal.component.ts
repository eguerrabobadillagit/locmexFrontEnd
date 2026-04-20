import { Component, OnInit, output, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonLabel, IonCard, IonCardContent, IonFooter,
  IonSpinner, IonIcon, IonTextarea, IonDatetime, IonDatetimeButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, copyOutline, qrCodeOutline, checkmarkOutline, calendarOutline, informationCircleOutline, timeOutline, warningOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface TrackingLinkResponse {
  token: string;
  publicUrl: string;
  expiresAtUtc: string;
}

@Component({
  selector: 'app-generate-link-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonCard, IonCardContent, IonFooter,
    IonSpinner, IonIcon, IonTextarea, IonDatetime, IonDatetimeButton
  ],
  templateUrl: './generate-link-modal.component.html',
  styleUrls: ['./generate-link-modal.component.scss']
})
export class GenerateLinkModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Inputs
  isOpen = input.required<boolean>();
  vehicleId = input.required<string>();
  vehiclePlate = input.required<string>();

  // Outputs
  close = output<void>();

  // Signals
  isGenerating = signal<boolean>(false);
  generatedLink = signal<TrackingLinkResponse | null>(null);
  linkCopied = signal<boolean>(false);
  minStartDate = signal<string>('');
  minEndDate = signal<string>('');

  // Form
  linkForm!: FormGroup;

  constructor() {
    addIcons({ closeOutline, copyOutline, qrCodeOutline, checkmarkOutline, calendarOutline, informationCircleOutline, timeOutline, warningOutline });
  }

  ngOnInit(): void {
    // Fecha/hora actual
    const now = new Date();
    // Fecha/hora de expiración por defecto: 1 día después (máximo permitido por el backend)
    const defaultExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Inicializar fechas mínimas (solo una vez, no en getters)
    this.minStartDate.set(now.toISOString());
    this.minEndDate.set(now.toISOString());

    this.linkForm = this.fb.group({
      startDate: [now.toISOString(), Validators.required],
      endDate: [defaultExpiration.toISOString(), Validators.required]
    });

    // Actualizar minEndDate cuando cambie startDate
    this.linkForm.get('startDate')?.valueChanges.subscribe((value) => {
      if (value) {
        this.minEndDate.set(value);
      }
    });
  }

  /**
   * Valida que la diferencia no exceda 24 horas (1440 minutos)
   */
  get isDurationValid(): boolean {
    const startDate = this.linkForm?.get('startDate')?.value;
    const endDate = this.linkForm?.get('endDate')?.value;
    
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    return diffMinutes <= 1440; // Máximo 24 horas
  }

  /**
   * Genera el link de tracking
   */
  generateLink(): void {
    if (this.linkForm.invalid) return;

    this.isGenerating.set(true);
    const { startDate, endDate } = this.linkForm.value;

    // Calcular diferencia en minutos entre startDate y endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const expiresInMinutes = Math.floor(diffMs / 60000); // 60000 ms = 1 minuto

    this.http.post<TrackingLinkResponse>(
      `${this.apiUrl}/vehicles/${this.vehicleId()}/share-link`,
      { 
        expiresInMinutes
      }
    ).subscribe({
      next: (response) => {
        this.generatedLink.set(response);
        this.isGenerating.set(false);
      },
      error: (error) => {
        console.error('Error al generar link:', error);
        this.isGenerating.set(false);
        // TODO: Mostrar mensaje de error al usuario
      }
    });
  }

  /**
   * Copia el link al portapapeles
   */
  async copyLink(): Promise<void> {
    const link = this.generatedLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link.publicUrl);
      this.linkCopied.set(true);
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        this.linkCopied.set(false);
      }, 2000);
    } catch (error) {
      console.error('Error al copiar link:', error);
    }
  }

  /**
   * Cierra el modal
   */
  onClose(): void {
    this.generatedLink.set(null);
    this.linkCopied.set(false);
    
    // Resetear fechas (1 día por defecto)
    const now = new Date();
    const defaultExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.linkForm.reset({ 
      startDate: now.toISOString(),
      endDate: defaultExpiration.toISOString()
    });
    
    this.close.emit();
  }
}
