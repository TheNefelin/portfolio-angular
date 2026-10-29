import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout-component/main-layout-component';
import { NotFoundPage } from './shared/pages/not-found-page/not-found-page';
import { AdminLayoutComponent } from './layouts/admin-layout-component/admin-layout-component';
import { ForbiddenPage } from '@shared/pages/forbidden-page/forbidden-page';

export const routes: Routes = [
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('@features/home/home.routes').then(m => m.routes),
			},
			{
				path: 'auth',
				loadChildren: () => import('@features/auth/auth.routes').then(m => m.routes),
			}
		],
	},
	{
		path: 'admin',
		component: AdminLayoutComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.routes),
			},
			{
				path: 'url-grp',
				loadChildren: () => import('@features/url-grp/url-grp.routes').then(m => m.routes),
			},
			{
				path: 'url',
				loadChildren: () => import('@features/url/url.routes').then(m => m.routes),
			},
			{
				path: 'language',
				loadChildren: () => import('@features/language/language.routes').then(m => m.routes),
			},
			{
				path: 'technology',
				loadChildren: () => import('@features/technology/technology.routes').then(m => m.routes),
			},
			{
				path: 'project',
				loadChildren: () => import('@features/project/project.routes').then(m => m.routes),
			},
		],
	},
	{
		path: 'forbidden',
		component: ForbiddenPage,
	},
	{
		path: '**',
		component: NotFoundPage,
	}
];
