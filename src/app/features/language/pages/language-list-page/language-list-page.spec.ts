import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageListPage } from './language-list-page';

describe('LanguageListPage', () => {
  let component: LanguageListPage;
  let fixture: ComponentFixture<LanguageListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
