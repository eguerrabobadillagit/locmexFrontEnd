import { Component, output } from '@angular/core';
import { IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [IonButton, IonIcon, IonBadge],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  // TODO: Obtener estos datos del servicio de autenticación
  userName = 'Admin LogiTrack';
  userRole = 'Dueño';
  
  logout = output<void>();

  onLogout() {
    this.logout.emit();
  }
}
