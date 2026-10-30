import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';
import { ProjectModel } from '@features/project/models/project-model';
import { ProjectService } from '@features/project/services/project-service';
import { CrudPage } from '@shared/base/crud-page';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { catchError, map, of } from 'rxjs';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  imports: [DatePipe, NgOptimizedImage, PaginationNavComponent, ButtonComponent, PaginationFilterComponent, LoadingComponent],
  selector: 'app-project-list-page',
  templateUrl: './project-list-page.html',
})
export class ProjectListPage extends CrudPage<ProjectModel> {
  // SERVICES ---------------------------------------------------------------
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
    
  // STATES -----------------------------------------------------------------
  protected readonly deleting = signal<boolean>(false);

  // FETCH-SERVICES-STATES --------------------------------------------------
  private readonly projectService = inject(ProjectService);
  protected readonly computedProjectPaginatedList = computed<ProjectModel[]>(() => this.getAllProjectPaginationRX.value() ?? []);

  protected readonly getAllProjectPaginationRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.projectService.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[ProjectService::ProjectPage] getAllProjectPaginationRX:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllProjectPaginationRX.reload();
  }

  protected onCreate(): void {
    this.router.navigate([ROUTES_CONSTANTS.ADMIN.PROJECT.FORM]);
  }

  protected onEdit(item: ProjectModel): void {
    this.router.navigate([ROUTES_CONSTANTS.ADMIN.PROJECT.FORM, item.id_project]);
  }

  // CRUD -------------------------------------------------------------------
  protected async onDelete(item: ProjectModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Proyecto',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.projectService.delete(item.id_project),
      { isSaving: this.deleting },
      {
        successMsg: 'Eliminado correctamente',
        errorMsg: 'Error al eliminar el Proyecto',
        onSuccess: () => this.reload(),
      }
    );
  }  
}
