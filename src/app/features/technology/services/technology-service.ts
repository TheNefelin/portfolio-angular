import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { Observable } from 'rxjs';
import { SaveTechnologyModel, TechnologyModel } from '@features/technology/models/technology-model';
import { UploadImageModel } from '@shared/models/upload-image-model';

@Service()
export class TechnologyService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'technology';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<TechnologyModel>> {
    let path = `page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<TechnologyModel>>(
      `${this.endpoint}/pagination?${path}`
    );
  }

  getAll(): Observable<TechnologyModel[]> {
    return this.apiService.getAll<TechnologyModel[]>(
      this.endpoint
    );
  }

  create(item: SaveTechnologyModel): Observable<TechnologyModel> {
    return this.apiService.create<TechnologyModel, SaveTechnologyModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveTechnologyModel): Observable<TechnologyModel> {
    return this.apiService.update<TechnologyModel, SaveTechnologyModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<TechnologyModel> {
    return this.apiService.uploadImage<TechnologyModel>(
      this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteImage<void>(
      this.endpoint, id
    );
  }  
}
