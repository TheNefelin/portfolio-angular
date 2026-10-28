import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { NavbarComponent } from '../../shared/components/navbar-component/navbar-component';

@Component({
  imports: [NavbarComponent, RouterOutlet, FooterComponent],
  selector: 'app-home-layout-component',
  templateUrl: './home-layout-component.html',
})
export class HomeLayoutComponent {}
