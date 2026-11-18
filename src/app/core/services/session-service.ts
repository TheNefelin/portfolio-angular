import { inject, Service, signal } from '@angular/core';
import { UserProfile } from '@features/auth/models/auth-profile';
import { catchError, Observable, of, tap } from 'rxjs';
import { ApiService } from '@core/services/api-service';

@Service()
export class SessionService {
  private readonly apiService = inject(ApiService);
  private readonly _user = signal<UserProfile | null>(null);
  private checked = false;

  readonly user = this._user.asReadonly();

  /** Pregunta al servidor una sola vez; `force` obliga a repetirlo (p. ej. tras el login). */
  check(force = false): Observable<UserProfile | null> {
    if (this.checked && !force) return of(this._user());
    return this.apiService.get<UserProfile>('auth/me').pipe(
      catchError(() => of(null)),
      tap((user) => {
        this._user.set(user);
        this.checked = true;
      }),
    );
  }

  clear(): void {
    this._user.set(null);
    this.checked = true;
  }
}
