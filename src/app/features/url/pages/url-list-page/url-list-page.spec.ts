import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlListPage } from './url-list-page';

describe('UrlListPage', () => {
  let component: UrlListPage;
  let fixture: ComponentFixture<UrlListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
