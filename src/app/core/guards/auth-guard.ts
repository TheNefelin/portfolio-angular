import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services/session-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  // En el servidor no hay cookies del usuario: no se decide nada ahí.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const router = inject(Router);
  return inject(SessionService).getUser().pipe(
    map((user) => {
      if (!user) return router.createUrlTree([ROUTES_CONSTANTS.AUTH]);
      if (user.role !== 'admin') return router.createUrlTree([ROUTES_CONSTANTS.FORBIDDEN]);
      return true;
    }),
  );
};
