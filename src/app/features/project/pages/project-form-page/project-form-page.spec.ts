import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectFormPage } from './project-form-page';

describe('ProjectFormPage', () => {
  let component: ProjectFormPage;
  let fixture: ComponentFixture<ProjectFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
