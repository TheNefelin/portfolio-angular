import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero-component/hero-component';
import { TitleComponent } from '../../components/title-component/title-component';
import { SocialComponent } from '../../components/social-component/social-component';
import { CertificationComponent } from '../../components/certification-component/certification-component';
import { ConsoleComponent } from '../../components/console-component/console-component';
import { CodeComponent } from '../../components/code-component/code-component';

@Component({
  imports: [HeroComponent, TitleComponent, SocialComponent, CertificationComponent, ConsoleComponent, CodeComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {}
