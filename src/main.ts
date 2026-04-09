import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

import { addIcons } from 'ionicons';
import { 
  checkmarkDoneOutline, 
  informationCircleOutline,
  water,
  speedometer,
  thermometer,
  pulse,
  flash,
  navigateCircle,
  batteryHalf,
  speedometerOutline,
  checkmark,
  list,
  grid,
  hardwareChip,
  personOutline,
  wifiOutline,
  bluetoothOutline,
  trashOutline,
  createOutline,
  personCircleOutline,
  businessOutline,
  closeOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  addOutline,
  listOutline,
  callOutline,
  hardwareChipOutline,
  documentTextOutline,
  carOutline,
  calendarOutline,
  barcodeOutline,
  logOutOutline,
  linkOutline,
  radioButtonOnOutline,
  checkmarkOutline,
  squareOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNgToast } from 'ng-angular-popup';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

// Registro global de iconos personalizados
addIcons({
  'checkmark-done-outline': checkmarkDoneOutline,
  'information-circle-outline': informationCircleOutline,
  'water': water,
  'speedometer': speedometer,
  'thermometer': thermometer,
  'pulse': pulse,
  'flash': flash,
  'navigate-circle': navigateCircle,
  'battery-half': batteryHalf,
  'speedometer-outline': speedometerOutline,
  'checkmark': checkmark,
  'list': list,
  'grid': grid,
  'hardware-chip': hardwareChip,
  'person-outline': personOutline,
  'wifi-outline': wifiOutline,
  'bluetooth-outline': bluetoothOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'person-circle-outline': personCircleOutline,
  'business-outline': businessOutline,
  'close-outline': closeOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'call-outline': callOutline,
  'hardware-chip-outline': hardwareChipOutline,
  'document-text-outline': documentTextOutline,
  'car-outline': carOutline,
  'calendar-outline': calendarOutline,
  'barcode-outline': barcodeOutline,
  'log-out-outline': logOutOutline,
  'link-outline': linkOutline,
  'radio-button-on-outline': radioButtonOnOutline,
  'checkmark-outline': checkmarkOutline,
  'square-outline': squareOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNgToast({
      duration: 3000,
      position: 'toaster-top-right',
      dismissible: true,
      showProgress: true
    }),
  ],
});
