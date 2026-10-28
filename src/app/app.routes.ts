import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout-component/home-layout-component';
import { HomePage } from './features/home/pages/home-page/home-page';
import { NotFoundPage } from './shared/pages/not-found-page/not-found-page';
import { UserLayoutComponent } from './layouts/user-layout-component/user-layout-component';

export const routes: Routes = [
	{
		path: '',
		component: HomeLayoutComponent,
		children: [
			{
				path: '',
				component: HomePage,
			},
		],
	},
	{
		path: 'admin',
		component: UserLayoutComponent,
	},
	{
		path: '**',
		component: NotFoundPage
	}
];
