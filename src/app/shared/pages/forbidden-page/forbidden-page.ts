import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { SessionService } from '@core/services/session-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { take } from 'rxjs';
import { UserDetailsComponent } from '@features/auth/components/user-details-component/user-details-component';

@Component({
  imports: [UserDetailsComponent],
  selector: 'app-forbidden-page',
  templateUrl: './forbidden-page.html',
})
export class ForbiddenPage {
  protected readonly router = inject(Router);
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
