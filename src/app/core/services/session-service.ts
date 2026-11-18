import { computed, inject, Service, signal } from '@angular/core';
import { UserProfile } from '@core/models/auth-profile';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from '@core/services/auth-service';

@Service()
export class SessionService {
  private readonly authService = inject(AuthService);
  // undefined = aún no se consultó; null = consultado, sin sesión; UserProfile = sesión activa.
  private readonly _user = signal<UserProfile | null | undefined>(undefined);

  // Se expone como UserProfile | null para no filtrar el estado interno (undefined).
  readonly user = computed<UserProfile | null>(() => this._user() ?? null);

  /** Devuelve el usuario de la sesión; consulta al servidor solo la primera vez
   * (o si `force` es true, p. ej. tras el login). Delega el HTTP a AuthService. */
  getUser(force = false): Observable<UserProfile | null> {
    const current = this._user();
    if (current !== undefined && !force) return of(current);
    return this.authService.me().pipe(
      catchError(() => of(null)),
      tap((user) => this._user.set(user)),
    );
  }

  clear(): void {
    this._user.set(null);
  }
}
