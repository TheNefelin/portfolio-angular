import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { ProjectModel } from '@features/project/models/project-model';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-project-card-list-component',
  templateUrl: './project-card-list-component.html',
})
export class ProjectCardListComponent {
  readonly isLoading = input<boolean>(false);
  readonly projectList = input<ProjectModel[]>([]);
}
