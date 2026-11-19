import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services/session-service';
import { Role, ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { map } from 'rxjs';

export type AuthRole = Role.Admin | Role.User;

/**
 * Guard de autenticación/autorización para rutas protegidas.
 *
 * @param requiredRole Rol mínimo requerido. Si se omite, basta con estar autenticado.
 *   - `undefined`: cualquier usuario autenticado pasa.
 *   - `'admin'`: solo rol admin pasa; el resto va a `/forbidden`.
 *   - `'user'`: solo rol user pasa.
 *
 * Uso: `canActivate: [authGuard()]` o `canActivate: [authGuard('admin')]`.
 */
export function authGuard(requiredRole?: AuthRole): CanActivateFn {
  return () => {
    // En el servidor no hay cookies del usuario: no se decide nada ahí.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
    const router = inject(Router);
    return inject(SessionService).getUser().pipe(
      map((user) => {
        if (!user) return router.createUrlTree([ROUTES_CONSTANTS.AUTH]);
        if (requiredRole && user.role !== requiredRole) {
          return router.createUrlTree([ROUTES_CONSTANTS.FORBIDDEN]);
        }
        return true;
      }),
    );
  };
}