import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAVIGATE_MENU_ITEM, ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly sections = NAVIGATE_MENU_ITEM.filter(
    item => item.navigateTo !== ROUTES_CONSTANTS.ADMIN.DASHBOARD,
  );
}
