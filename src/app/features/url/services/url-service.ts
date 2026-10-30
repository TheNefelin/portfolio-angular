import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { Observable } from 'rxjs';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { FilterByUrlGrp, SaveUrlModel, UrlDetailModel, UrlModel } from '@features/url/models/url-model';

@Service()
export class UrlService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'url';

  getAllPagination(params: PaginationRequestModel<FilterByUrlGrp | null>): Observable<PaginationResponseModel<UrlDetailModel>> {
    let path = `page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    if (params.filter)
      if (params.filter.id_urlgrp && params.filter.id_urlgrp > 0)
        path = `${path}&id_urlgrp=${params.filter.id_urlgrp}`;

    return this.apiService.getAll<PaginationResponseModel<UrlDetailModel>>(
      `${this.endpoint}/pagination?${path}`
    );
  }

  create(item: SaveUrlModel): Observable<UrlModel> {
    return this.apiService.create<UrlModel, SaveUrlModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveUrlModel): Observable<UrlModel> {
    return this.apiService.update<UrlModel, SaveUrlModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }
}
