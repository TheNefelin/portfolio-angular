import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-title-component',
  templateUrl: './title-component.html',
})
export class TitleComponent {
  readonly title = input.required<string>();
}
