import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlGrpListPage } from './url-grp-list-page';

describe('UrlGrpListPage', () => {
  let component: UrlGrpListPage;
  let fixture: ComponentFixture<UrlGrpListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlGrpListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlGrpListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
