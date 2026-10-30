import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';
import { SaveTechnologyModel, TechnologyModel } from '@features/technology/models/technology-model';
import { TechnologyService } from '@features/technology/services/technology-service';
import { CrudPage } from '@shared/base/crud-page';
import { catchError, map, of, switchMap } from 'rxjs';
import { TechnologyFormComponent } from '@features/technology/components/technology-form-component/technology-form-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';

@Component({
  imports: [DatePipe, NgOptimizedImage, TechnologyFormComponent, PaginationNavComponent, ButtonComponent, LoadingComponent, PaginationFilterComponent],
  selector: 'app-technology-list-page',
  templateUrl: './technology-list-page.html',
})
export class TechnologyListPage extends CrudPage<TechnologyModel> {
  // SERVICES ---------------------------------------------------------------
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);

  // STATES -----------------------------------------------------------------  
  protected readonly showFormModal = signal<boolean>(false);
    
  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly technologyService = inject(TechnologyService);
  protected readonly computedTechnologyPaginatedList = computed<TechnologyModel[]>(() => this.getAllTechnologyPaginationRX.value() ?? []);
  protected readonly technology = {
    savePayload: signal<TechnologyModel | null>(null),
    isSaving: signal<boolean>(false),
  };
    
  protected readonly getAllTechnologyPaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.technologyService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[TechnologyService::TechnologyPage] getAllTechnologyPaginationRX:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllTechnologyPaginationRX.reload();
  }
 
  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.technology.savePayload.set(null);
  }

  // CRUD -------------------------------------------------------------------
  protected onCreate(): void {
    this.technology.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: TechnologyModel): void {
    this.technology.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onDeleteImage(): void {
    const id = this.technology.savePayload()?.id_technology;
    if (!id) return;

    this.mutation.run(
      this.technologyService.deleteImage(id),
      this.technology,
      {
        successMsg: 'Imagen eliminada correctamente',
        errorMsg: 'Error al eliminar la imagen',
        onSuccess: () => {
          this.technology.savePayload.update(item => item ? { ...item, img_url: null } : item);
          this.reload();
        },
      }
    );
  }

  protected async onDelete(item: TechnologyModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Technology',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.technologyService.delete(item.id_technology),
      this.technology,
      {
        successMsg: 'Technology eliminado correctamente',
        errorMsg: 'Error al eliminar el Technology',
        onSuccess: () => this.reload(),
      }
    );
  }

  protected onSubmitForm({ data, file }: { data: SaveTechnologyModel; file: File | null }): void {
    const id = this.technology.savePayload()?.id_technology;

    const request$ = id
      ? this.technologyService.update(id, data)
      : this.technologyService.create(data);

    const action$ = request$.pipe(
      switchMap(result => {
        const entityId = result?.id_technology ?? id;

        if (entityId && file) {
          return this.technologyService.uploadImage(entityId, { file });
        }

        return of(result);
      })
    );

    this.mutation.run(
      action$,
      this.technology,
      {
        successMsg: id ? 'Technology modificado correctamente' : 'Technology creado correctamente',
        errorMsg: id ? 'Error al modificar el Technology' : 'Error al crear el Technology',
        onSuccess: () => this.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.technology.savePayload.set(null);
        },
      }
    );
  }
}
