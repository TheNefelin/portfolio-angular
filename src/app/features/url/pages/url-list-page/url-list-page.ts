import { Component, computed, inject } from '@angular/core';
import { CrudPage } from '../../../../shared/base/crud-page';
import { UrlModel } from '../../models/url-model';
import { UrlService } from '../../services/url-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [JsonPipe],
  selector: 'app-url-list-page',
  templateUrl: './url-list-page.html',
})
export class UrlListPage extends CrudPage<UrlModel> {
  private readonly urlService = inject(UrlService);
  protected readonly computedList = computed<UrlModel[]>(() => this.getAllPaginationRX.value() ?? []);
  
  protected readonly getAllPaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.urlService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[UrlService::UrlPage] getAllPagination:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });
  
  protected override reload(): void {
    throw new Error('Method not implemented.');
  }
}
