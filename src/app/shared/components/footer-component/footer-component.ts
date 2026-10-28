import { Component, input } from '@angular/core';
import { UrlGrpDetailModel } from '../../../features/url-grp/models/url-grp-model';

@Component({
  imports: [],
  selector: 'app-footer-component',
  templateUrl: './footer-component.html',
})
export class FooterComponent {
  protected readonly urlGrpDetailList = input<UrlGrpDetailModel[]>([]); 
}
