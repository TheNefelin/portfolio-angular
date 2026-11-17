import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiAuthGoogleRequest, ApiAuthLoginRequest, ApiAuthRegisterRequest, RegisterForm, UserProfile } from '@features/auth/models/auth-profile';
import { ApiService } from '@core/services/api-service';

@Service()
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'auth';
  
  loginGoogle(item: ApiAuthGoogleRequest): Observable<void> {
    return this.apiService
      .create<unknown, ApiAuthGoogleRequest>(`${this.endpoint}/google`, item)
      .pipe(map(() => void 0));
  }

  me(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`${this.endpoint}/me`);
  }

  login(item: ApiAuthLoginRequest): Observable<void> {
    return this.apiService
      .create<unknown, ApiAuthLoginRequest>(`${this.endpoint}/login`, item)
      .pipe(map(() => void 0));
  }

  register(item: RegisterForm): Observable<void> {
    const payload: ApiAuthRegisterRequest = { email: item.email, password: item.password };
    return this.apiService
      .create<unknown, ApiAuthRegisterRequest>(`${this.endpoint}/register`, payload)
      .pipe(map(() => void 0));
  }

  logout(): Observable<{ status: string }> {
    return this.apiService.post<{ status: string }>(`${this.endpoint}/logout`);
  }
}
