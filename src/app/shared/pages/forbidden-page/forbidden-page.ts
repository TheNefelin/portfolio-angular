import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-forbidden-page',
  templateUrl: './forbidden-page.html',
})
export class ForbiddenPage {
  private location = inject(Location);
  
  protected navigateBack(): void {
    this.location.back();
  }
}
