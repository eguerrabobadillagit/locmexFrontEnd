import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tracking-expired',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  template: `
    <ion-content>
      <div class="error-container">
        <ion-icon name="time-outline" color="warning"></ion-icon>
        <h1>Enlace Expirado</h1>
        <p>Este enlace de tracking ha expirado o ha sido revocado.</p>
        <p class="subtitle">Por favor, solicita un nuevo enlace al propietario del vehículo.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f5f5f5;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      text-align: center;

      ion-icon {
        font-size: 80px;
        margin-bottom: 24px;
      }

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 16px 0;
      }

      p {
        font-size: 16px;
        color: #666;
        margin: 0 0 8px 0;
        max-width: 500px;
      }

      .subtitle {
        font-size: 14px;
        color: #999;
      }
    }
  `]
})
export class TrackingExpiredComponent {
  constructor() {
    addIcons({ timeOutline });
  }
}
