import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonItem, IonInput, IonCheckbox, IonButton, IonText, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  carSportOutline, 
  personOutline, 
  lockClosedOutline, 
  logInOutline 
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonItem,
    IonInput,
    IonCheckbox,
    IonButton,
    IonText,
    IonLabel
  ]
})
export class AuthPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    addIcons({
      'car-sport-outline': carSportOutline,
      'person-outline': personOutline,
      'lock-closed-outline': lockClosedOutline,
      'log-in-outline': logInOutline
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage.set('Credenciales inválidas. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }
}
