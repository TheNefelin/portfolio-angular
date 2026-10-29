import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ProjectModel } from '@features/project/models/project-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { Observable } from 'rxjs';

@Service()
export class ProjectService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'project';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<ProjectModel>> {
    let path = `page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<ProjectModel>>(
      `${this.endpoint}/pagination?${path}`
    );
  }

  getAll() {
    return this.apiService.getAll<ProjectModel[]>(
      `${this.endpoint}`
    );
  }
}
