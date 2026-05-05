import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonAccordionGroup,
  IonAccordion
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gridOutline, 
  carOutline, 
  sendOutline, 
  cubeOutline, 
  mapOutline, 
  locationOutline, 
  shapesOutline, 
  constructOutline, 
  radioOutline, 
  hardwareChipOutline, 
  settingsOutline, 
  personOutline, 
  cartOutline,
  navigateOutline,
  personCircleOutline,
  peopleOutline
} from 'ionicons/icons';

interface MenuItem {
  title: string;
  icon: string;
  id: string;
}

interface MenuGroup {
  title: string;
  icon: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonAccordionGroup,
    IonAccordion
  ]
})
export class NavbarComponent {
  selectedMenu = input<string>('dashboard');
  menuSelect = output<string>();

  menuGroups: MenuGroup[] = [
    {
      title: 'Monitoreo',
      icon: 'radio-outline',
      items: [
        // { title: 'Dashboard', icon: 'grid-outline', id: 'dashboard' },
        { title: 'Mapa en Vivo', icon: 'map-outline', id: 'map-view' },
        // { title: 'Telemetría', icon: 'radio-outline', id: 'telemetria' },
        { title: 'Geocercas', icon: 'shapes-outline', id: 'geocercas' }
      ]
    },
    {
      title: 'Operaciones',
      icon: 'cube-outline',
      items: [
        // { title: 'Despacho', icon: 'send-outline', id: 'despacho' },
        // { title: 'Rutas', icon: 'navigate-outline', id: 'rutas' },
        { title: 'Vehículos', icon: 'car-outline', id: 'vehiculos' },
        // { title: 'Conductor', icon: 'person-circle-outline', id: 'conductor' }
      ]
    },
    // {
    //   title: 'Inventario',
    //   icon: 'cube-outline',
    //   items: [
    //     { title: 'Almacén', icon: 'cube-outline', id: 'almacen' },
    //     { title: 'Productos', icon: 'cart-outline', id: 'productos' },
    //     { title: 'Puntos de Interés', icon: 'location-outline', id: 'puntos' }
    //   ]
    // },
    {
      title: 'Gestión',
      icon: 'settings-outline',
      items: [
        // { title: 'Servicios', icon: 'construct-outline', id: 'servicios' },
        { title: 'Dispositivos GPS', icon: 'hardware-chip-outline', id: 'dispositivos' },
        // { title: 'Portal de Cliente', icon: 'person-outline', id: 'portal' },
        { title: 'Usuarios', icon: 'people-outline', id: 'usuarios' }
      ]
    }
  ];

  constructor() {
    addIcons({
      'grid-outline': gridOutline,
      'car-outline': carOutline,
      'send-outline': sendOutline,
      'cube-outline': cubeOutline,
      'map-outline': mapOutline,
      'location-outline': locationOutline,
      'shapes-outline': shapesOutline,
      'construct-outline': constructOutline,
      'radio-outline': radioOutline,
      'hardware-chip-outline': hardwareChipOutline,
      'settings-outline': settingsOutline,
      'person-outline': personOutline,
      'cart-outline': cartOutline,
      'navigate-outline': navigateOutline,
      'person-circle-outline': personCircleOutline,
      'people-outline': peopleOutline
    });
  }

  onMenuSelect(id: string) {
    this.menuSelect.emit(id);
  }
}
