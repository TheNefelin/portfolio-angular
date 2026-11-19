import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-footer-component',
  templateUrl: './footer-component.html',
})
export class FooterComponent { 
  protected readonly getYear = new Date().getFullYear();
}
