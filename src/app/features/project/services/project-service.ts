import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ProjectModel, SaveProjectModel } from '@features/project/models/project-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { UploadImageModel } from '@shared/models/upload-image-model';
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

  getById(id: number): Observable<ProjectModel | null> {
    return this.apiService.getById<ProjectModel | null>(
      this.endpoint, id
    );
  }  

  create(item: SaveProjectModel): Observable<ProjectModel> {
    return this.apiService.create<ProjectModel, SaveProjectModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveProjectModel): Observable<ProjectModel> {
    return this.apiService.update<ProjectModel, SaveProjectModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<ProjectModel> {
    return this.apiService.uploadImage<ProjectModel>(
      this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteImage<void>(
      this.endpoint, id
    );
  }  
}
