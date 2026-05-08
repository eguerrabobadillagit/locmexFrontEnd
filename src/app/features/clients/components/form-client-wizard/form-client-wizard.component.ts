import { Component, OnInit, output, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WizardStepperComponent } from '../../../../core/components/wizard-stepper/wizard-stepper.component';
import { WizardConfig, WizardStep } from '../../../../core/interfaces/wizard.interface';
import { WizardConfirmationSummaryComponent, ConfirmationSection } from '../../../../core/components/wizard-confirmation-summary/wizard-confirmation-summary.component';
import { addIcons } from 'ionicons';
import { 
  businessOutline, 
  personOutline, 
  checkmarkCircleOutline,
  mailOutline,
  callOutline,
  closeOutline,
  checkmarkOutline,
  warningOutline,
  documentTextOutline
} from 'ionicons/icons';
import { CreateClientRequest, ClientResponse } from '../../interfaces/client-request.interface';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-form-client-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    WizardStepperComponent,
    WizardConfirmationSummaryComponent
  ],
  templateUrl: './form-client-wizard.component.html',
  styleUrls: ['./form-client-wizard.component.scss']
})
export class FormClientWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);

  clientId = input<string | undefined>();
  clientSubmitted = output<CreateClientRequest>();
  wizardCancelled = output<void>();

  currentStep = signal<number>(0);
  isSubmitting = signal<boolean>(false);

  clientForm!: FormGroup;

  isEditMode = computed(() => !!this.clientId());

  wizardConfig = computed<WizardConfig>(() => ({
    title: this.isEditMode() ? 'Editar Cliente' : 'Crear Cliente',
    icon: 'business-outline',
    totalSteps: 3,
    closable: true
  }));

  steps = signal<WizardStep[]>([
    { id: 'basic-info', label: 'Información Básica', icon: 'business-outline', completed: false },
    { id: 'contact-info', label: 'Datos de Contacto', icon: 'person-outline', completed: false },
    { id: 'confirmation', label: 'Confirmación', icon: 'checkmark-circle-outline', completed: false }
  ]);

  confirmationSections = computed<ConfirmationSection[]>(() => {
    const formValue = this.clientForm?.value;
    
    return [
      {
        title: 'Información Básica',
        subtitle: 'Datos generales del cliente',
        icon: 'business-outline',
        iconColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        fields: [
          { label: 'Nombre', value: formValue?.name || '—' },
          { label: 'Código Externo', value: formValue?.externalCode || '—', icon: 'document-text-outline' },
          { label: 'Estado', value: formValue?.isActive === true ? 'Activo' : 'Inactivo' }
        ]
      },
      {
        title: 'Datos de Contacto',
        subtitle: 'Información de contacto del cliente',
        icon: 'person-outline',
        iconColor: '#10b981',
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        fields: [
          { label: 'Nombre de Contacto', value: formValue?.contactName || '—', icon: 'person-outline' },
          { label: 'Email', value: formValue?.contactEmail || '—', icon: 'mail-outline' },
          { label: 'Teléfono', value: formValue?.contactPhone || '—', icon: 'call-outline' }
        ]
      }
    ];
  });

  constructor() {
    addIcons({
      'business-outline': businessOutline,
      'person-outline': personOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'mail-outline': mailOutline,
      'call-outline': callOutline,
      'close-outline': closeOutline,
      'checkmark-outline': checkmarkOutline,
      'warning-outline': warningOutline,
      'document-text-outline': documentTextOutline
    });
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.clientId()) {
      this.loadClientData();
    }
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      externalCode: [''],
      isActive: [true, Validators.required]
    });
  }

  loadClientData(): void {
    const id = this.clientId();
    if (!id) return;

    this.clientService.getClientById(id).subscribe({
      next: (client: ClientResponse) => {
        this.clientForm.patchValue({
          name: client.name,
          contactName: client.contactName,
          contactEmail: client.contactEmail || '',
          contactPhone: client.contactPhone || '',
          externalCode: client.externalCode || '',
          isActive: client.isActive
        });
      },
      error: (err) => {
        console.error('Error loading client:', err);
      }
    });
  }

  nextStep(): void {
    if (this.currentStep() < this.steps().length - 1) {
      if (this.isStepValid(this.currentStep())) {
        this.markStepCompleted(this.currentStep());
        this.currentStep.set(this.currentStep() + 1);
      }
    } else {
      this.submit();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  markStepCompleted(stepIndex: number): void {
    const updatedSteps = this.steps().map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    );
    this.steps.set(updatedSteps);
  }

  cancel(): void {
    this.wizardCancelled.emit();
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return (this.clientForm.get('name')?.valid ?? false) && 
               (this.clientForm.get('isActive')?.valid ?? false);
      case 1:
        return (this.clientForm.get('contactName')?.valid ?? false);
      default:
        return true;
    }
  }

  submit(): void {
    if (this.clientForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      const formData: CreateClientRequest = {
        ...this.clientForm.value,
        clientType: 'cliente'
      };
      this.clientSubmitted.emit(formData);
    }
  }

  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }

  getClientInitial(): string {
    const name = this.clientForm.get('name')?.value || 'C';
    return name.charAt(0).toUpperCase();
  }

  getClientAvatarColor(): string {
    const name = this.clientForm.get('name')?.value || 'Client';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  }
}
