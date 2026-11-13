import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth-service';
import { ToastService } from '@core/services/toast-service';
import { catchError, from, switchMap, throwError } from 'rxjs';

const API_PATTERN = /\/ssr-api\/api\//;
const AUTH_PATTERN = /\/ssr-api\/auth\//;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  // Solo la API propia y nunca las llamadas de login/refresh/logout.
  if (!API_PATTERN.test(req.url) || AUTH_PATTERN.test(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();

  return next(token ? attachToken(req, token) : req).pipe(
    catchError((error) => {
      if (error?.status !== 401 || !token) {
        return throwError(() => error);
      }

      return from(authService.refresh()).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            void authService.logout();
            toastService.show('Sesión expirada, inicia sesión de nuevo', 'info');
            return throwError(() => error);
          }

          return next(attachToken(req, newToken));
        }),
      );
    }),
  );
};

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
