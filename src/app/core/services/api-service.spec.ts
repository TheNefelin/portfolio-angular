import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api-service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() should call /ssr-api/{endpoint}', () => {
    service.get('auth/me').subscribe();
    const req = httpMock.expectOne('/ssr-api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getAll() should call /ssr-api/{endpoint}', () => {
    service.getAll('project').subscribe();
    const req = httpMock.expectOne('/ssr-api/project');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById() should call /ssr-api/{endpoint}/{id}', () => {
    service.getById('project', 42).subscribe();
    const req = httpMock.expectOne('/ssr-api/project/42');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('create() should POST to /ssr-api/{endpoint}', () => {
    const body = { name: 'Test' };
    service.create('project', body).subscribe();
    const req = httpMock.expectOne('/ssr-api/project');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('update() should PUT to /ssr-api/{endpoint}/{id}', () => {
    const body = { name: 'Updated' };
    service.update('project', 5, body).subscribe();
    const req = httpMock.expectOne('/ssr-api/project/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('delete() should DELETE /ssr-api/{endpoint}/{id}', () => {
    service.delete('project', 7).subscribe();
    const req = httpMock.expectOne('/ssr-api/project/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('uploadImage() should POST FormData to /ssr-api/{endpoint}/{id}/upload-image', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    service.uploadImage('project', 3, file).subscribe();
    const req = httpMock.expectOne('/ssr-api/project/3/upload-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({});
  });

  it('deleteImage() should DELETE /ssr-api/{endpoint}/{id}/image', () => {
    service.deleteImage('project', 9).subscribe();
    const req = httpMock.expectOne('/ssr-api/project/9/image');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
