import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechnologyListPage } from './technology-list-page';

describe('TechnologyListPage', () => {
  let component: TechnologyListPage;
  let fixture: ComponentFixture<TechnologyListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologyListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
