import { Routes } from "@angular/router";
import { ProjectListPage } from "@features/project/pages/project-list-page/project-list-page";
import { ProjectFormPage } from "@features/project/pages/project-form-page/project-form-page";

export const routes: Routes = [
  {
    path: '',
    component: ProjectListPage
  },
  {
    path: 'form',
    component: ProjectFormPage
  },
  {
    path: 'form/:id',
    component: ProjectFormPage
  },
]
