import { Component, OnInit, output, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WizardStepperComponent } from '../../../../core/components/wizard-stepper/wizard-stepper.component';
import { WizardConfig, WizardStep } from '../../../../core/interfaces/wizard.interface';
import { WizardConfirmationSummaryComponent, ConfirmationSection } from '../../../../core/components/wizard-confirmation-summary/wizard-confirmation-summary.component';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  shieldCheckmarkOutline, 
  businessOutline, 
  checkmarkCircleOutline,
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  callOutline,
  closeOutline,
  gitNetworkOutline,
  briefcaseOutline,
  headsetOutline,
  checkmarkOutline,
  warningOutline
} from 'ionicons/icons';
import { CreateUserRequest, UserResponse } from '../../interfaces/user-request.interface';
import { UserRole, RoleInfo } from '../../interfaces/user.model';
import { UserService } from '../../services/user.service';
import { roleDefinitions } from '../../mock/mock-data';
import { ClientService } from '../../../devices/services/client.service';
import { Client } from '../../../devices/interfaces/client.interface';
import { ModalSearchableGridComponent } from '../../../../core/components/modal-searchable-grid/modal-searchable-grid.component';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-form-user-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    WizardStepperComponent,
    WizardConfirmationSummaryComponent,
    ModalSearchableGridComponent
  ],
  templateUrl: './form-user-wizard.component.html',
  styleUrls: ['./form-user-wizard.component.scss']
})
export class FormUserWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly clientService = inject(ClientService);

  userId = input<string | undefined>();
  userSubmitted = output<CreateUserRequest>();
  wizardCancelled = output<void>();

  currentStep = signal<number>(0);
  showPassword = signal<boolean>(false);
  selectedRole = signal<UserRole | null>(null);
  isSubmitting = signal<boolean>(false);
  clients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);

  userForm!: FormGroup;
  roleDefinitions: RoleInfo[] = roleDefinitions;

  isEditMode = computed(() => !!this.userId());

  wizardConfig = computed<WizardConfig>(() => ({
    title: this.isEditMode() ? 'Editar Usuario' : 'Crear Usuario',
    icon: 'person-add-outline',
    totalSteps: 4,
    closable: true
  }));

  steps = signal<WizardStep[]>([
    { id: 'personal-info', label: 'Información', icon: 'person-outline', completed: false },
    { id: 'role-access', label: 'Rol y Acceso', icon: 'shield-checkmark-outline', completed: false },
    { id: 'company-contact', label: 'Empresa', icon: 'business-outline', completed: false },
    { id: 'confirmation', label: 'Confirmación', icon: 'checkmark-circle-outline', completed: false }
  ]);

  selectedRolePermissions = computed(() => {
    const role = this.selectedRole();
    if (!role) return [];
    return this.roleDefinitions.find(r => r.id === role)?.permissions || [];
  });

  selectedRoleName = computed(() => {
    const role = this.selectedRole();
    if (!role) return '';
    return this.roleDefinitions.find(r => r.id === role)?.name || '';
  });

  clientColumnDefs = signal<ColDef[]>([
    {
      headerName: 'Nombre',
      field: 'name',
      flex: 1,
      minWidth: 200
    },
    {
      headerName: 'Contacto',
      field: 'contactName',
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Teléfono',
      field: 'contactPhone',
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'Estado',
      field: 'isActive',
      width: 100,
      cellRenderer: (params: any) => {
        return params.value ? 
          '<span style="color: #10b981; font-weight: 500;">Activo</span>' : 
          '<span style="color: #ef4444; font-weight: 500;">Inactivo</span>';
      }
    }
  ]);

  confirmationSections = computed<ConfirmationSection[]>(() => {
    const formValue = this.userForm?.value;
    const roleInfo = this.roleDefinitions.find(r => r.id === formValue?.roleCode);
    
    return [
      {
        title: 'Información Personal',
        subtitle: 'Datos básicos de acceso del usuario',
        icon: 'person-outline',
        iconColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        fields: [
          { label: 'Nombre Completo', value: formValue?.fullName || '—' },
          { label: 'Correo Electrónico', value: formValue?.email || '—', icon: 'mail-outline' }
        ]
      },
      {
        title: 'Rol y Acceso',
        subtitle: 'Nivel jerárquico y permisos del usuario',
        icon: 'shield-checkmark-outline',
        iconColor: '#8b5cf6',
        backgroundColor: '#f5f3ff',
        borderColor: '#8b5cf6',
        fields: [
          { label: 'Rol', value: roleInfo?.name || '—', icon: 'shield-outline' },
          { label: 'Estado', value: formValue?.isActive === true ? 'Activo' : 'Inactivo' },
          { label: 'Fecha de Caducidad', value: formValue?.expirationDate || '—', icon: 'calendar-outline' }
        ]
      },
      {
        title: 'Cliente y Contacto',
        subtitle: 'Datos del cliente y teléfono',
        icon: 'business-outline',
        iconColor: '#10b981',
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        fields: [
          { label: 'Cliente', value: this.selectedClient()?.name || '—', icon: 'business-outline' },
          { label: 'Teléfono', value: formValue?.phone || '—', icon: 'call-outline' }
        ]
      }
    ];
  });

  constructor() {
    addIcons({
      'person-outline': personOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'business-outline': businessOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'mail-outline': mailOutline,
      'call-outline': callOutline,
      'close-outline': closeOutline,
      'git-network-outline': gitNetworkOutline,
      'briefcase-outline': briefcaseOutline,
      'headset-outline': headsetOutline,
      'checkmark-outline': checkmarkOutline,
      'warning-outline': warningOutline
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    
    if (this.userId()) {
      this.loadUserData();
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      roleCode: ['operator', Validators.required],
      isActive: [true, Validators.required],
      expirationDate: [''],
      clientId: ['', Validators.required]
    });

    this.userForm.get('roleCode')?.valueChanges.subscribe(role => {
      this.selectedRole.set(role);
    });

    this.selectedRole.set('operator');
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients.set(clients);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
      }
    });
  }

  loadUserData(): void {
    const id = this.userId();
    if (!id) return;

    this.userService.getUserById(id).subscribe({
      next: (user: UserResponse) => {
        this.userForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          roleCode: user.roleCode,
          isActive: user.isActive,
          expirationDate: user.expirationDate || '',
          clientId: user.clientId
        });
        this.selectedRole.set(user.roleCode as UserRole);
        
        // Buscar y establecer el cliente seleccionado
        if (user.clientId) {
          const client = this.clients().find(c => c.id === user.clientId);
          if (client) {
            this.selectedClient.set(client);
          }
        }
      },
      error: (err) => {
        console.error('Error loading user:', err);
      }
    });
  }

  onClientSelected(client: Client): void {
    this.selectedClient.set(client);
    this.userForm.patchValue({ clientId: client.id });
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
        return (this.userForm.get('fullName')?.valid ?? false) && 
               (this.userForm.get('email')?.valid ?? false) && 
               (this.isEditMode() || (this.userForm.get('password')?.valid ?? false));
      case 1:
        return (this.userForm.get('roleCode')?.valid ?? false) && 
               (this.userForm.get('isActive')?.valid ?? false);
      case 2:
        return (this.userForm.get('clientId')?.valid ?? false);
      default:
        return true;
    }
  }

  selectRole(role: UserRole): void {
    this.userForm.patchValue({ roleCode: role });
    this.selectedRole.set(role);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  submit(): void {
    if (this.userForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      const formData: CreateUserRequest = this.userForm.value;
      this.userSubmitted.emit(formData);
    }
  }

  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }

  getRoleIcon(roleId: UserRole): string {
    const icons: Record<UserRole, string> = {
      platform_admin: 'shield-checkmark-outline',
      partner_admin: 'git-network-outline',
      customer_admin: 'briefcase-outline',
      operator: 'headset-outline'
    };
    return icons[roleId];
  }

  getUserInitial(): string {
    const fullName = this.userForm.get('fullName')?.value || 'U';
    return fullName.charAt(0).toUpperCase();
  }

  getUserAvatarColor(): string {
    const fullName = this.userForm.get('fullName')?.value || 'User';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const colorIndex = fullName.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  }

  getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      platform_admin: '#7c3aed',
      partner_admin: '#2563eb',
      customer_admin: '#059669',
      operator: '#ea580c'
    };
    return colors[role];
  }

  getRoleBadgeBgColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      platform_admin: '#f3e8ff',
      partner_admin: '#dbeafe',
      customer_admin: '#d1fae5',
      operator: '#fed7aa'
    };
    return colors[role];
  }
}
