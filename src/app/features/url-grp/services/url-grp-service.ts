import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { SaveUrlGrpModel, UrlGrpDetailModel, UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { Observable } from 'rxjs';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';

@Service()
export class UrlGrpService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'url-grp';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<UrlGrpModel>> {
    let path = `page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<UrlGrpModel>>(
      `${this.endpoint}/pagination?${path}`
    );
  }

  getAllDetail() {
    return this.apiService.getAll<UrlGrpDetailModel[]>(
      `${this.endpoint}/detail`
    );
  }

  create(item: SaveUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.create<UrlGrpModel, SaveUrlGrpModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.update<UrlGrpModel, SaveUrlGrpModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }
}
