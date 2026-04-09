import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, delay, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../interfaces/user-request.interface';
import { mockUsers } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  // Mock data storage
  private mockUserData = signal<UserResponse[]>([...mockUsers]);

  // Signals para estado
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Flag para usar mock data (cambiar a false cuando el backend esté listo)
  private readonly useMockData = true;

  getUsers(): Observable<UserResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.useMockData) {
      return of(this.mockUserData()).pipe(
        delay(500), // Simular latencia de red
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

    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
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

    if (this.useMockData) {
      const user = this.mockUserData().find(u => u.id === id);
      if (!user) {
        return throwError(() => new Error('Usuario no encontrado'));
      }
      return of(user).pipe(
        delay(300),
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

    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(
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

    if (this.useMockData) {
      const newUser: UserResponse = {
        id: `user-${Date.now()}`,
        tenantId: 'tenant-1',
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: 'Empresa Mock', // En producción vendrá del backend
        phone: user.phone,
        vehicleCount: 0,
        status: user.status,
        expirationDate: user.expirationDate,
        createdAtUtc: new Date().toISOString()
      };

      const currentUsers = this.mockUserData();
      this.mockUserData.set([...currentUsers, newUser]);

      return of(newUser).pipe(
        delay(500),
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

    return this.http.post<UserResponse>(this.apiUrl, user).pipe(
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

    if (this.useMockData) {
      const currentUsers = this.mockUserData();
      const index = currentUsers.findIndex(u => u.id === id);
      
      if (index === -1) {
        return throwError(() => new Error('Usuario no encontrado'));
      }

      const updatedUser: UserResponse = {
        ...currentUsers[index],
        ...user,
        companyName: user.companyId ? 'Empresa Mock' : currentUsers[index].companyName
      };

      const newUsers = [...currentUsers];
      newUsers[index] = updatedUser;
      this.mockUserData.set(newUsers);

      return of(updatedUser).pipe(
        delay(500),
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

    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user).pipe(
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

    if (this.useMockData) {
      const currentUsers = this.mockUserData();
      const filteredUsers = currentUsers.filter(u => u.id !== id);
      this.mockUserData.set(filteredUsers);

      return of(void 0).pipe(
        delay(500),
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

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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
