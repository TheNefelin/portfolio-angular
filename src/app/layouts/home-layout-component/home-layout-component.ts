import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { NavbarComponent } from '../../shared/components/navbar-component/navbar-component';
import { UrlGrpService } from '../../features/url-grp/services/url-grp-service';
import { UrlGrpDetailModel } from '../../features/url-grp/models/url-grp-model';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ButtonBackToTopComponent } from '@shared/components/button-back-to-top-component/button-back-to-top-component';

@Component({
  imports: [NavbarComponent, RouterOutlet, FooterComponent, ButtonBackToTopComponent],
  selector: 'app-home-layout-component',
  templateUrl: './home-layout-component.html',
})
export class HomeLayoutComponent {
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
