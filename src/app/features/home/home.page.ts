import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
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
import { Subscription, filter } from 'rxjs';

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
export class HomePage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly menuController = inject(MenuController);
  private routerSubscription?: Subscription;
  
  selectedMenu = signal<string>('dashboard');
  showFleetPanel = signal<boolean>(false);

  ngOnInit() {
    // Sincronizar con la ruta actual al iniciar
    this.updateSelectedMenuFromUrl(this.router.url);
    
    // Escuchar cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSelectedMenuFromUrl(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private updateSelectedMenuFromUrl(url: string): void {
    // Extraer el último segmento de la URL (ej: /home/map-view -> map-view)
    const segments = url.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1];
    
    // Si es una ruta válida del menú, actualizar
    if (lastSegment && lastSegment !== 'home') {
      this.selectedMenu.set(lastSegment);
      
      // Mostrar panel de flota si es map-view
      if (lastSegment === 'map-view') {
        this.showFleetPanel.set(true);
      }
    }
  }

  async selectMenu(id: string) {
    this.selectedMenu.set(id);
    
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
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
