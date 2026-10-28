import { Component, computed, inject } from '@angular/core';
import { UrlGrpService } from '../../services/url-grp-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CrudPage } from '../../../../shared/base/crud-page';
import { UrlGrpDetailModel, UrlGrpModel } from '../../models/url-grp-model';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [JsonPipe],
  selector: 'app-url-grp-list-page',
  templateUrl: './url-grp-list-page.html',
})
export class UrlGrpListPage extends CrudPage<UrlGrpModel> {
  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedList = computed<UrlGrpModel[]>(() => this.getAllPaginationRX.value() ?? []);
  protected readonly computedUrlGrpDetailList = computed<UrlGrpDetailModel[]>(() => this.getAllDetailRX.value() ?? []);

  protected readonly getAllPaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.urlGrpService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[UrlGrpService::UrlGrpPage] getAllPagination:', err);
          return of(this.emptyPaginated());
        })
      );
    },
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

  protected override reload(): void {
    throw new Error('Method not implemented.');
  }  
}
