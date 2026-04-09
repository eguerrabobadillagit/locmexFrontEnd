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

@Component({
  selector: 'app-form-user-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    WizardStepperComponent,
    WizardConfirmationSummaryComponent
  ],
  templateUrl: './form-user-wizard.component.html',
  styleUrls: ['./form-user-wizard.component.scss']
})
export class FormUserWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  userId = input<string | undefined>();
  userSubmitted = output<CreateUserRequest>();
  wizardCancelled = output<void>();

  currentStep = signal<number>(0);
  showPassword = signal<boolean>(false);
  selectedRole = signal<UserRole | null>(null);
  isSubmitting = signal<boolean>(false);

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

  confirmationSections = computed<ConfirmationSection[]>(() => {
    const formValue = this.userForm?.value;
    const roleInfo = this.roleDefinitions.find(r => r.id === formValue?.role);
    
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
          { label: 'Estado', value: formValue?.status === 'active' ? 'Activo' : 'Inactivo' },
          { label: 'Fecha de Caducidad', value: formValue?.expirationDate || '—', icon: 'calendar-outline' }
        ]
      },
      {
        title: 'Empresa y Contacto',
        subtitle: 'Datos de la empresa y teléfono',
        icon: 'business-outline',
        iconColor: '#10b981',
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        fields: [
          { label: 'Empresa', value: formValue?.companyId || '—', icon: 'business-outline' },
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
    
    if (this.userId()) {
      this.loadUserData();
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['operator', Validators.required],
      status: ['active', Validators.required],
      expirationDate: [''],
      companyId: ['company-1', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]+$/)]]
    });

    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole.set(role);
    });

    this.selectedRole.set('operator');
  }

  loadUserData(): void {
    const id = this.userId();
    if (!id) return;

    this.userService.getUserById(id).subscribe({
      next: (user: UserResponse) => {
        this.userForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          expirationDate: user.expirationDate || '',
          companyId: user.companyId,
          phone: user.phone
        });
        this.selectedRole.set(user.role);
      },
      error: (err) => {
        console.error('Error loading user:', err);
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
        return (this.userForm.get('fullName')?.valid ?? false) && 
               (this.userForm.get('email')?.valid ?? false) && 
               (this.isEditMode() || (this.userForm.get('password')?.valid ?? false));
      case 1:
        return (this.userForm.get('role')?.valid ?? false) && 
               (this.userForm.get('status')?.valid ?? false);
      case 2:
        return (this.userForm.get('companyId')?.valid ?? false) && 
               (this.userForm.get('phone')?.valid ?? false);
      default:
        return true;
    }
  }

  selectRole(role: UserRole): void {
    this.userForm.patchValue({ role });
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

  getRoleIcon(roleId: UserRole): string {
    const icons: Record<UserRole, string> = {
      owner: 'shield-checkmark-outline',
      distributor: 'git-network-outline',
      client: 'briefcase-outline',
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
      owner: '#7c3aed',
      distributor: '#2563eb',
      client: '#059669',
      operator: '#ea580c'
    };
    return colors[role];
  }

  getRoleBadgeBgColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      owner: '#f3e8ff',
      distributor: '#dbeafe',
      client: '#d1fae5',
      operator: '#fed7aa'
    };
    return colors[role];
  }
}
