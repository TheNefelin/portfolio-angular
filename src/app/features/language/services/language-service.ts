import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { Observable } from 'rxjs';
import { LanguageModel, SaveLanguageModel } from '@features/language/models/language-model';
import { UploadImageModel } from '@shared/models/upload-image-model';

@Service()
export class LanguageService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'language';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<LanguageModel>> {
    let path = `page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() !== '')
      path = `${path}&search=${encodeURIComponent(params.search)}`;

    return this.apiService.getAll<PaginationResponseModel<LanguageModel>>(
      `${this.endpoint}/pagination?${path}`
    );
  }

  getAll(): Observable<LanguageModel[]> {
    return this.apiService.getAll<LanguageModel[]>(
      this.endpoint
    );
  }

  create(item: SaveLanguageModel): Observable<LanguageModel> {
    return this.apiService.create<LanguageModel, SaveLanguageModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveLanguageModel): Observable<LanguageModel> {
    return this.apiService.update<LanguageModel, SaveLanguageModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<LanguageModel> {
    return this.apiService.uploadImage<LanguageModel>(
      this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteImage<void>(
      this.endpoint, id
    );
  }
}
