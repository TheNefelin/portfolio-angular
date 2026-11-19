import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UrlGrpDetailModel } from '@features/url-grp/models/url-grp-model';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { catchError, of } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  imports: [LoadingComponent],
  selector: 'app-library-page',
  templateUrl: './library-page.html',
})
export class LibraryPage {
  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedUrlGrpDetailList = computed<UrlGrpDetailModel[]>(() => this.getAllUrlGrpDetailRX.value() ?? []);

  protected readonly getAllUrlGrpDetailRX = rxResource({
    stream: () => {
      return this.urlGrpService.getAllDetail().pipe(
        catchError(err => {
          console.error('[UrlGrpService::LibraryPage] getAllUrlGrpDetailRX:', err);
          return of([]);
        })
      );
    },
  });  
}