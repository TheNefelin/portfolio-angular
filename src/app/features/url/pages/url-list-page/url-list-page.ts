import { Component, computed, inject, signal } from '@angular/core';
import { CrudPage } from '@shared/base/crud-page';
import { FilterByUrlGrp, SaveUrlModel, UrlDetailModel, UrlModel } from '@features/url/models/url-model';
import { UrlService } from '@features/url/services/url-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';
import { UrlFormComponent } from '@features/url/components/url-form-component/url-form-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { SelectSearchComponent } from '@shared/components/select-search-component/select-search-component';
import { DatePipe } from '@angular/common';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';

@Component({
  imports: [DatePipe, UrlFormComponent, PaginationNavComponent, ButtonComponent, LoadingComponent, PaginationFilterComponent, SelectSearchComponent],
  selector: 'app-url-list-page',
  templateUrl: './url-list-page.html',
})
export class UrlListPage extends CrudPage<UrlDetailModel> {
  // SERVICES ---------------------------------------------------------------  
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);

  // STATES -----------------------------------------------------------------  
  protected readonly showFormModal = signal<boolean>(false);
  private readonly selectedUrlGrpId = signal<number | null>(null);

  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedUrlGrpList = computed<SelectItemModel[]>(() => {
    const items = this.getAllUrlGrpRX.value() ?? [];
    return items.map(e => ({ id: e.id_urlgrp, name: e.name, img_url: null }));
  });
  
  private readonly urlService = inject(UrlService);
  protected readonly computedUrlPaginatedList = computed<UrlDetailModel[]>(() => this.getAllUrlPaginationRX.value() ?? []);
  private readonly getAllUrlPayload = computed<PaginationRequestModel<FilterByUrlGrp | null>>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search(),
    filter: this.selectedUrlGrpId() ? { id_urlgrp: this.selectedUrlGrpId()! } : null,
  }));
  protected readonly url = {
    savePayload: signal<UrlModel | null>(null),
    isSaving: signal<boolean>(false),
  };  
  
  protected readonly getAllUrlGrpRX = rxResource({
    stream: () => {
      return this.urlGrpService.getAllDetail().pipe(
        catchError(err => {
          console.error('[UrlGrpService::UrlPage] getAllUrlGrpRX:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getAllUrlPaginationRX = rxResource({
    params: () => this.getAllUrlPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.urlService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[UrlService::UrlPage] getAllUrlPaginationRX:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });
  
  // EVENTS -----------------------------------------------------------------  
  protected override reload(): void {
    this.getAllUrlGrpRX.reload();
    this.getAllUrlPaginationRX.reload();
  }

  protected onUrlGrpChange(item: SelectItemModel): void {
    this.selectedUrlGrpId.set(item.id);
    this.currentPage.set(1);
  }  

  protected onUrlGrpClear(): void {
    this.selectedUrlGrpId.set(null);
    this.currentPage.set(1);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.url.savePayload.set(null);
  }
  
  // CRUD -------------------------------------------------------------------
  protected onCreate(): void {
    this.url.savePayload.set(null);
    this.showFormModal.set(true);
  }
  
  protected onEdit(item: UrlModel): void {
    this.url.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected async onDelete(item: UrlModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Url',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.urlService.delete(item.id_url),
      this.url,
      {
        successMsg: 'Url eliminada correctamente',
        errorMsg: 'Error al eliminar la Url',
        onSuccess: () => this.getAllUrlPaginationRX.reload(),
      }
    );
  }

  protected onSubmitForm(data: SaveUrlModel): void {
    const id = this.url.savePayload()?.id_url;

    this.mutation.run(
      id ? this.urlService.update(id, data) : this.urlService.create(data),
      this.url,
      {
        successMsg: id ? 'Url modificada correctamente' : 'Url creada correctamente',
        errorMsg: id ? 'Error al modificar la Url' : 'Error al crear la Url',
        onSuccess: () => this.getAllUrlPaginationRX.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.url.savePayload.set(null);
        },
      }
    );
  }  
}
