import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonMenu, 
  IonButtons, 
  IonMenuButton,
  IonSplitPane,
  IonFooter,
  MenuController
} from '@ionic/angular/standalone';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FleetTrackingViewComponent } from './components/fleet-tracking-view/fleet-tracking-view.component';
import { UserMenuComponent } from '../../core/components/user-menu/user-menu.component';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonMenu, 
    IonButtons, 
    IonMenuButton,
    IonSplitPane,
    IonFooter,
    RouterOutlet,
    NavbarComponent,
    FleetTrackingViewComponent,
    UserMenuComponent
  ],
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly menuController = inject(MenuController);
  
  selectedMenu = 'dashboard';
  showFleetPanel = signal<boolean>(false);

  async selectMenu(id: string) {
    this.selectedMenu = id;
    
    // Cerrar el menú en dispositivos móviles
    await this.menuController.close();
    
    if (id === 'map-view') {
      this.showFleetPanel.set(true);
      this.router.navigate(['/home', id]);
    } else {
      this.router.navigate(['/home', id]);
    }
  }

  closeFleetPanel() {
    this.showFleetPanel.set(false);
  }

  onLogout() {
    console.log('Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
