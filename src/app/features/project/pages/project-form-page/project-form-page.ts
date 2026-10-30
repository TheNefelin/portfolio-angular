import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { LanguageService } from '@features/language/services/language-service';
import { SaveProjectModel } from '@features/project/models/project-model';
import { ProjectService } from '@features/project/services/project-service';
import { TechnologyService } from '@features/technology/services/technology-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { SelectItemModel } from '@shared/models/select-item-model';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ProjectFormComponent } from '@features/project/components/project-form-component/project-form-component';

@Component({
  imports: [LoadingComponent, ButtonComponent, ProjectFormComponent],
  selector: 'app-project-form-page',
  templateUrl: './project-form-page.html',
})
export class ProjectFormPage {
  // SERVICES ---------------------------------------------------------------  
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
   
  // STATES -----------------------------------------------------------------
  readonly routeId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => Number(params.get('id')) || 0)
    ),
    { initialValue: 0 }
  );

  protected readonly isLoading = computed<boolean>(() =>
    [
      this.getProjectByIdRX,
      this.getAllLanguageRX,
      this.getAllTechnologyRX,
    ].some(e => e.isLoading())
  );

  protected readonly isEditMode = computed(() => this.routeId() > 0);
  
  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly projectService = inject(ProjectService);
  private readonly getProjectByIdPayload = computed(() => this.routeId());
  protected readonly computedProject = computed(() => this.getProjectByIdRX.value() ?? null);
  protected readonly project = {
    isSaving: signal<boolean>(false),
  };

  private readonly languageService = inject(LanguageService);
  protected readonly computedLanguageList = computed<SelectItemModel[]>(() => {
    const items = this.getAllLanguageRX.value() ?? [];
    return items.map(e => ({ id: e.id_language, name: e.name, img_url: e.img_url }));
  });

  private readonly technologyService = inject(TechnologyService);
  protected readonly computedTechnologyList = computed<SelectItemModel[]>(() => {
    const items = this.getAllTechnologyRX.value() ?? [];
    return items.map(e => ({ id: e.id_technology, name: e.name, img_url: e.img_url }));
  });

  protected readonly getProjectByIdRX = rxResource({
    params: () => this.getProjectByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.projectService.getById(id).pipe(
        catchError(err => {
          console.error('[ProjectService::ProjectFormPage] getProjectByIdRX:', err);
          return of(null);
        })
      );
    },
  });

  protected readonly getAllLanguageRX = rxResource({
    stream: () => {
      return this.languageService.getAll().pipe(
        catchError(err => {
          console.error('[LanguageService::ProjectFormPage] getAllLanguageRX:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getAllTechnologyRX = rxResource({
    stream: () => {
      return this.technologyService.getAll().pipe(
        catchError(err => {
          console.error('[TechnologyService::ProjectFormPage] getAllTechnologyRX:', err);
          return of([]);
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected goToProject(): void {
    this.router.navigate([ROUTES_CONSTANTS.ADMIN.PROJECT.ROOT]);
  }

  // CRUD -------------------------------------------------------------------  
  protected onDeleteImage(): void {
    const id = this.getProjectByIdPayload();
    if (!id) return;

    this.project.isSaving.set(true);

    this.projectService.deleteImage(id).pipe(
      finalize(() => this.project.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.getProjectByIdRX.reload();
      },
      error: (err) => {
        console.error('[ProjectService::ProjectFormPage] onDeleteImage:', err);
      }
    });
  }

  protected onSubmit({ data, file }: { data: SaveProjectModel; file: File | null }): void {
    this.project.isSaving.set(true);
    const id = this.getProjectByIdPayload();

    const request$ = id
      ? this.projectService.update(id, data)
      : this.projectService.create(data);

    request$.pipe(
      switchMap(result => {
        if (file)
          return this.projectService.uploadImage(result.id_project, { file });

        return of(result);
      }),
      finalize(() => {
        this.getProjectByIdRX.reload();
        this.project.isSaving.set(false);
      })
    ).subscribe({
      next: (result) => {
        this.toastService.show('Guardado correctamente');
        if (!id && result) {
          this.router.navigate([ROUTES_CONSTANTS.ADMIN.PROJECT.FORM, result.id_project]);
        }
      },
      error: (err) => {
        console.error('[ProjectService::ProjectFormPage] onSubmitForm:', err);
      }
    });
  }
}
