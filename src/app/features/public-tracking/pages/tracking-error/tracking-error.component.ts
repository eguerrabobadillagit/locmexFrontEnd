import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tracking-error',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  template: `
    <ion-content>
      <div class="error-container">
        <ion-icon name="warning-outline" color="warning"></ion-icon>
        <h1>Error de Conexión</h1>
        <p>No se pudo conectar con el servidor de tracking.</p>
        <p class="subtitle">Por favor, intenta nuevamente más tarde.</p>
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
export class TrackingErrorComponent {
  constructor() {
    addIcons({ warningOutline });
  }
}
