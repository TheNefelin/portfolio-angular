import { Component, computed, inject } from '@angular/core';

import { RouterOutlet, RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { UrlGrpService } from '../../features/url-grp/services/url-grp-service';
import { UrlGrpDetailModel } from '../../features/url-grp/models/url-grp-model';
import { NAVIGATE_MENU_ITEM } from '../../shared/constants/routes-constant';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ButtonBackToTopComponent } from '@shared/components/button-back-to-top-component/button-back-to-top-component';
import { AuthGoogleComponent } from '@features/auth/components/auth-google-component/auth-google-component';

@Component({
  imports: [FooterComponent, RouterOutlet, RouterLink, ButtonBackToTopComponent, AuthGoogleComponent],
  selector: 'app-user-layout-component',
  templateUrl: './user-layout-component.html',
})
export class UserLayoutComponent {
  protected readonly navigateMenuItem = NAVIGATE_MENU_ITEM

  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedUrlGrpDetailList = computed<UrlGrpDetailModel[]>(() => this.getAllDetailRX.value() ?? []);

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
}
