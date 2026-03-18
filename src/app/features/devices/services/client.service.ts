import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../interfaces/client.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  getClients(): Observable<Client[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Client[]>(this.apiUrl).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los clientes');
          this.isLoading.set(false);
        }
      })
    );
  }
}
