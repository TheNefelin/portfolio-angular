import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api-service';
import { PaginationRequestModel } from '../../../shared/models/pagination-request-model';
import { Observable } from 'rxjs';
import { PaginationResponseModel } from '../../../shared/models/pagination-response-model';
import { UrlModel } from '../models/url-model';

@Service()
export class UrlService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'url';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<UrlModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<UrlModel>>(
      `${this.endpoint}/pagination/${path}`
    );
  }

  
}
