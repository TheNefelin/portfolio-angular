import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-button-back-to-top-component',
  templateUrl: './button-back-to-top-component.html',
})
export class ButtonBackToTopComponent {
  handleArrowUpClick(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0 });
  }
}
