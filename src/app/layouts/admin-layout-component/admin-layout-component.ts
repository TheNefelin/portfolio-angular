import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer-component/footer-component';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { UrlGrpDetailModel } from '@features/url-grp/models/url-grp-model';
import { NAVIGATE_MENU_ITEM, ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, take } from 'rxjs';
import { ButtonBackToTopComponent } from '@shared/components/button-back-to-top-component/button-back-to-top-component';
import { UserDetailsComponent } from '@features/auth/components/user-details-component/user-details-component';
import { AuthService } from '@features/auth/services/auth-service';
import { SessionService } from '@core/services/session-service';

@Component({
  imports: [FooterComponent, RouterOutlet, RouterLink, ButtonBackToTopComponent, UserDetailsComponent],
  selector: 'app-admin-layout-component',
  templateUrl: './admin-layout-component.html',
})
export class AdminLayoutComponent {
  // SERVICES ---------------------------------------------------------------
  protected readonly router = inject(Router);

  // STATES -----------------------------------------------------------------
  protected readonly navigateMenuItem = NAVIGATE_MENU_ITEM

  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly authService = inject(AuthService);
  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedUrlGrpDetailList = computed<UrlGrpDetailModel[]>(() => this.getAllDetailRX.value() ?? []);
  private readonly session = inject(SessionService);
  
  // Usa SessionService para no repetir la petición: se ejecuta una sola vez
  // y se cachea en el signal; el rxResource gestiona loading/error/value.
  protected readonly userProfile = rxResource({
    stream: () => this.session.getUser(),
  });

  protected readonly getAllDetailRX = rxResource({
    stream: () => {
      return this.urlGrpService.getAllDetail().pipe(
        catchError(err => {
          console.error('[UrlGrpService::UrlGrpPage] getAllDetailRX:', err);
          return of([]);
        })
      );
    },
  });

  // CRUD -------------------------------------------------------------------
  protected logout(): void {
    // Revoca la sesión en el servidor (fire-and-forget): no bloquea el cierre
    // local aunque el backend falle o esté caído.
    this.authService.logout().pipe(take(1)).subscribe({ error: () => undefined });
    this.session.clear();

    this.router.navigate([ROUTES_CONSTANTS.HOME]);
  }
}
