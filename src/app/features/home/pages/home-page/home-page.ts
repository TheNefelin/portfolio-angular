import { Component, computed, inject } from '@angular/core';
import { HeroComponent } from '@features/home/components/hero-component/hero-component';
import { TitleComponent } from '@features/home/components/title-component/title-component';
import { SocialComponent } from '@features/home/components/social-component/social-component';
import { CertificationComponent } from '@features/home/components/certification-component/certification-component';
import { ConsoleComponent } from '@features/home/components/console-component/console-component';
import { CodeComponent } from '@features/home/components/code-component/code-component';
import { rxResource } from '@angular/core/rxjs-interop';
import { CrudPage } from '@shared/base/crud-page';
import { ProjectModel } from '@features/project/models/project-model';
import { catchError, map, of } from 'rxjs';
import { ProjectService } from '@features/project/services/project-service';
import { ProjectCardListComponent } from '@features/project/components/project-card-list-component/project-card-list-component';

@Component({
  imports: [HeroComponent, TitleComponent, SocialComponent, CertificationComponent, ConsoleComponent, CodeComponent, ProjectCardListComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly service = inject(ProjectService);
  protected readonly computedProjectList = computed<ProjectModel[]>(() => this.getAllProjectRX.value() ?? []);
  
  protected readonly getAllProjectRX = rxResource({
    stream: () => {
      return this.service.getAll().pipe(
        map(response => response),
        catchError(err => {
          console.error('[ProjectService::HomePage] getAllProjectRX:', err);
          return of([]);
        })
      );
    },
  });

}
