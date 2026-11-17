import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/ssr-api';

  get<TResponse>(endpoint: string) {
    return this.http.get<TResponse>(`${this.baseUrl}/${endpoint}`);
  }

  post<TResponse>(endpoint: string) {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, {});
  }

  getAll<TResponse>(endpoint: string) {
    return this.http.get<TResponse>(`${this.baseUrl}/${endpoint}`);
  }

  getById<TResponse>(endpoint: string, id: number) {
    return this.http.get<TResponse>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<TResponse, TBody>(endpoint: string, body: TBody) {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, body);
  }

  update<TResponse, TBody>(endpoint: string, id: number, body: TBody) {
    return this.http.put<TResponse>(`${this.baseUrl}/${endpoint}/${id}`, body);
  }

  delete<TResponse>(endpoint: string, id: number) {
    return this.http.delete<TResponse>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  uploadImage<T>(endpoint: string, id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<T>(`${this.baseUrl}/${endpoint}/${id}/upload-image`, formData);
  }

  deleteImage<T>(endpoint: string, id: number) {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}/image`);
  }
}
