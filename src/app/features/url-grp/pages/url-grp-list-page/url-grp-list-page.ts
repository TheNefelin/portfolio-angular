import { Component, computed, inject, signal } from '@angular/core';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CrudPage } from '@shared/base/crud-page';
import { SaveUrlGrpModel, UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { DatePipe } from '@angular/common';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';
import { UrlGrpFormComponent } from '@features/url-grp/components/url-grp-form-component/url-grp-form-component';

@Component({
  imports: [DatePipe, ButtonComponent, PaginationFilterComponent, PaginationNavComponent, LoadingComponent, UrlGrpFormComponent],
  selector: 'app-url-grp-list-page',
  templateUrl: './url-grp-list-page.html',
})
export class UrlGrpListPage extends CrudPage<UrlGrpModel> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  
  private readonly urlGrpService = inject(UrlGrpService);
  protected readonly computedUrlGrpPaginatedList = computed<UrlGrpModel[]>(() => this.getAllPaginationRX.value() ?? []);
  protected readonly urlGrp = {
    savePayload: signal<UrlGrpModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  protected readonly getAllPaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.urlGrpService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[UrlGrpService::UrlGrpPage] getAllPagination:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllPaginationRX.reload();
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.urlGrp.savePayload.set(null);
  }

  protected onCreate(): void {
    this.urlGrp.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: UrlGrpModel): void {
    this.urlGrp.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected async onDelete(item: UrlGrpModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Url Grp',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.urlGrpService.delete(item.id_urlgrp),
      this.urlGrp,
      {
        successMsg: 'Url Grp eliminado correctamente',
        errorMsg: 'Error al eliminar el Url Grp',
        onSuccess: () => this.reload(),
      }
    );
  }

  protected onSubmitForm(data: SaveUrlGrpModel): void {
    const id = this.urlGrp.savePayload()?.id_urlgrp;

    this.mutation.run(
      id ? this.urlGrpService.update(id, data) : this.urlGrpService.create(data),
      this.urlGrp,
      {
        successMsg: id ? 'Url Grp modificado correctamente' : 'Url Grp creado correctamente',
        errorMsg: id ? 'Error al modificar el Url Grp' : 'Error al crear el Url Grp',
        onSuccess: () => this.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.urlGrp.savePayload.set(null);
        },
      }
    );
  }
}
