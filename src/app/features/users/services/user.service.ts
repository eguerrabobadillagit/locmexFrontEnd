import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../interfaces/user-request.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  getUsers(): Observable<UserResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar los usuarios');
          this.isLoading.set(false);
        }
      })
    );
  }

  getUserById(id: string): Observable<UserResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar el usuario');
          this.isLoading.set(false);
        }
      })
    );
  }

  createUser(user: CreateUserRequest): Observable<UserResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<UserResponse>(`${this.apiUrl}/users`, user).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al crear el usuario');
          this.isLoading.set(false);
        }
      })
    );
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<UserResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, user).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al actualizar el usuario');
          this.isLoading.set(false);
        }
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al eliminar el usuario');
          this.isLoading.set(false);
        }
      })
    );
  }
}
