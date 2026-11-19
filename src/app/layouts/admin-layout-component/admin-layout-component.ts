import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer-component/footer-component';
import { NAVIGATE_MENU_ITEM, ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { rxResource } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ButtonBackToTopComponent } from '@shared/components/button-back-to-top-component/button-back-to-top-component';
import { UserDetailsComponent } from '@features/auth/components/user-details-component/user-details-component';
import { AuthService } from '@core/services/auth-service';
import { SessionService } from '@core/services/session-service';

@Component({
  imports: [FooterComponent, RouterOutlet, RouterLink, ButtonBackToTopComponent, UserDetailsComponent],
  selector: 'app-admin-layout-component',
  templateUrl: './admin-layout-component.html',
})
export class AdminLayoutComponent {
  protected readonly router = inject(Router);
  protected readonly navigateMenuItem = NAVIGATE_MENU_ITEM

  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);
  protected readonly userProfile = rxResource({
    stream: () => this.session.getUser(),
  });

  protected logout(): void {
    this.authService.logout().pipe(take(1)).subscribe({ error: () => undefined });
    this.session.clear();
    this.router.navigate([ROUTES_CONSTANTS.HOME]);
  }
}