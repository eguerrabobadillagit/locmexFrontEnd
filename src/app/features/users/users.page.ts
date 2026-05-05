import { Component, AfterViewInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { PageHeaderComponent } from '../../core/components/page-header/page-header.component';
import { DataToolbarComponent } from '../../core/components/data-toolbar/data-toolbar.component';
import { IFilterOption } from '../../core/models/filter-option.interface';
import { FormUserWizardComponent } from './components/form-user-wizard/form-user-wizard.component';
import { userColumnDefs } from './utils/column-definitions.util';
import { userFilterOptions, userGridOptions } from './utils/grid-config.util';
import { UserService } from './services/user.service';
import { CreateUserRequest, UserResponse } from './interfaces/user-request.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    AgGridAngular,
    PageHeaderComponent,
    DataToolbarComponent,
    FormUserWizardComponent
  ],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss']
})
export class UsersPage implements AfterViewInit {
  private readonly userService = inject(UserService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  @ViewChild('userWizard') userWizard?: FormUserWizardComponent;

  users = signal<UserResponse[]>([]);
  filteredUsers = signal<UserResponse[]>([]);
  quickFilterText = signal<string>('');
  showUserWizard = signal<boolean>(false);
  selectedUserId = signal<string | undefined>(undefined);
  
  filterOptions: IFilterOption[] = userFilterOptions;
  columnDefs: ColDef[] = userColumnDefs;
  gridOptions: GridOptions = userGridOptions;

  constructor() {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      gridContainer.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          const button = target.classList.contains('edit-btn') ? target : target.closest('.edit-btn');
          const userId = button?.getAttribute('data-id');
          if (userId) {
            this.onEditUser(userId);
          }
        }
        
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
          const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
          const userId = button?.getAttribute('data-id');
          if (userId) {
            this.onDeleteUser(userId);
          }
        }
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.updateFilterCounts(users);
      },
      error: async (err) => {
        console.error('Error loading users:', err);
        const toast = await this.toastController.create({
          message: 'Error al cargar los usuarios',
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
    const allUsers = this.users();
    
    if (filterValue === 'all') {
      this.filteredUsers.set(allUsers);
    } else if (filterValue === 'active') {
      const filtered = allUsers.filter(user => user.isActive === true);
      this.filteredUsers.set(filtered);
    } else if (filterValue === 'inactive') {
      const filtered = allUsers.filter(user => user.isActive === false);
      this.filteredUsers.set(filtered);
    }
  }

  onCreateUser(): void {
    this.selectedUserId.set(undefined);
    this.showUserWizard.set(true);
  }

  onEditUser(userId: string): void {
    this.selectedUserId.set(userId);
    this.showUserWizard.set(true);
  }

  async onDeleteUser(userId: string): Promise<void> {
    const user = this.users().find(u => u.id === userId);
    if (!user) return;

    const alert = await this.alertController.create({
      header: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar al usuario "${user.fullName}"?`,
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
            this.deleteUserConfirmed(userId);
          }
        }
      ]
    });

    await alert.present();
  }

  private deleteUserConfirmed(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Usuario eliminado exitosamente',
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();
        this.loadUsers();
      },
      error: async (err) => {
        console.error('Error deleting user:', err);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el usuario',
          duration: 3000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle'
        });
        await toast.present();
      }
    });
  }

  onUserCreated(userData: CreateUserRequest): void {
    const userId = this.selectedUserId();

    if (userId) {
      this.userService.updateUser(userId, userData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Usuario actualizado exitosamente',
            duration: 3000,
            position: 'top',
            color: 'success',
            icon: 'checkmark-circle'
          });
          await toast.present();
          this.loadUsers();
          this.showUserWizard.set(false);
        },
        error: async (err) => {
          console.error('Error updating user:', err);
          this.userWizard?.resetSubmitting();
          const toast = await this.toastController.create({
            message: err.error?.message || 'Error al actualizar el usuario',
            duration: 3000,
            position: 'top',
            color: 'danger',
            icon: 'alert-circle'
          });
          await toast.present();
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Usuario creado exitosamente',
            duration: 3000,
            position: 'top',
            color: 'success',
            icon: 'checkmark-circle'
          });
          await toast.present();
          this.loadUsers();
          this.showUserWizard.set(false);
        },
        error: async (err) => {
          console.error('Error creating user:', err);
          this.userWizard?.resetSubmitting();
          const toast = await this.toastController.create({
            message: err.error?.message || 'Error al crear el usuario',
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
    this.showUserWizard.set(false);
    this.selectedUserId.set(undefined);
  }

  private updateFilterCounts(users: UserResponse[]): void {
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
