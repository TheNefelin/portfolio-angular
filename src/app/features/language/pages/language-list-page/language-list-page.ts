import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';
import { LanguageModel, SaveLanguageModel } from '@features/language/models/language-model';
import { LanguageService } from '@features/language/services/language-service';
import { CrudPage } from '@shared/base/crud-page';
import { catchError, map, of, switchMap } from 'rxjs';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { LanguageFormComponent } from '@features/language/components/language-form-component/language-form-component';
import { DatePipe, NgOptimizedImage } from '@angular/common';

@Component({
  imports: [DatePipe, NgOptimizedImage, PaginationNavComponent, PaginationFilterComponent, ButtonComponent, LoadingComponent, LanguageFormComponent],
  selector: 'app-language-list-page',
  templateUrl: './language-list-page.html',
})
export class LanguageListPage extends CrudPage<LanguageModel> {
  // SERVICES ---------------------------------------------------------------  
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);

  // STATES -----------------------------------------------------------------
  protected readonly showFormModal = signal<boolean>(false);

  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly languageService = inject(LanguageService);
  protected readonly computedLanguagePaginatedList = computed<LanguageModel[]>(() => this.getAllLanguagePaginationRX.value() ?? []);
  protected readonly language = {
    savePayload: signal<LanguageModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  protected readonly getAllLanguagePaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.languageService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[LanguageService::LanguagePage] getAllLanguagePaginationRX:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });
 
  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllLanguagePaginationRX.reload();
  }
  
  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.language.savePayload.set(null);
  }

  // CRUD -------------------------------------------------------------------
  protected onCreate(): void {
    this.language.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: LanguageModel): void {
    this.language.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onDeleteImage(): void {
    const id = this.language.savePayload()?.id_language;
    if (!id) return;

    this.mutation.run(
      this.languageService.deleteImage(id),
      this.language,
      {
        successMsg: 'Imagen eliminada correctamente',
        errorMsg: 'Error al eliminar la imagen',
        onSuccess: () => {
          this.language.savePayload.update(item => item ? { ...item, img_url: null } : item);
          this.reload();
        },
      }
    );
  }  

  protected async onDelete(item: LanguageModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Language',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.languageService.delete(item.id_language),
      this.language,
      {
        successMsg: 'Language eliminado correctamente',
        errorMsg: 'Error al eliminar el Language',
        onSuccess: () => this.reload(),
      }
    );
  }

  protected onSubmitForm({ data, file }: { data: SaveLanguageModel; file: File | null }): void {
    const id = this.language.savePayload()?.id_language;

    const request$ = id
      ? this.languageService.update(id, data)
      : this.languageService.create(data);

    const action$ = request$.pipe(
      switchMap(result => {
        const entityId = result?.id_language ?? id;

        if (entityId && file) {
          return this.languageService.uploadImage(entityId, { file });
        }

        return of(result);
      })
    );

    this.mutation.run(
      action$,
      this.language,
      {
        successMsg: id ? 'Language modificado correctamente' : 'Language creado correctamente',
        errorMsg: id ? 'Error al modificar el Language' : 'Error al crear el Language',
        onSuccess: () => this.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.language.savePayload.set(null);
        },
      }
    );
  }
}
