import { Component, input, output } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage, ButtonComponent, LoadingComponent],
  selector: 'app-select-list-component',
  templateUrl: './select-list-component.html',
})
export class SelectListComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<SelectItemModel[]>([]);
  readonly deleteItem = output<SelectItemModel>();
}
