import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api-service';
import { UrlGrpDetailModel, UrlGrpModel } from '../models/url-grp-model';
import { Observable } from 'rxjs';
import { PaginationRequestModel } from '../../../shared/models/pagination-request-model';
import { PaginationResponseModel } from '../../../shared/models/pagination-response-model';

@Service()
export class UrlGrpService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'url-grp';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<UrlGrpModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<UrlGrpModel>>(
      `${this.endpoint}/pagination/${path}`
    );
  }

  getAllDetail() {
    return this.apiService.getAll<UrlGrpDetailModel[]>(
      `${this.endpoint}/detail`
    );
  }
}
