import { Component, output, inject, computed } from '@angular/core';
import { IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [IonButton, IonIcon, IonBadge],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  
  userName = computed(() => this.authService.currentUser()?.email || 'usuario@email.com');
  userRole = computed(() => {
    const roleCode = this.authService.currentUser()?.roleCode;
    const roleMap: Record<string, string> = {
      'platform_admin': 'Dueño',
      'partner_admin': 'Distribuidor',
      'customer_admin': 'Cliente',
      'operator': 'Operador'
    };
    return roleMap[roleCode || ''] || 'Usuario';
  });
  
  logout = output<void>();

  onLogout() {
    this.logout.emit();
  }
}
