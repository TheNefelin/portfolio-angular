import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared/components/footer-component/footer-component';
import { NavbarComponent } from '@shared/components/navbar-component/navbar-component';
import { ButtonBackToTopComponent } from '@shared/components/button-back-to-top-component/button-back-to-top-component';

@Component({
  imports: [NavbarComponent, RouterOutlet, FooterComponent, ButtonBackToTopComponent],
  selector: 'app-main-layout-component',
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {}
