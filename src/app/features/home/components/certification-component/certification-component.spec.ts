import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificationComponent } from './certification-component';

describe('CertificationComponent', () => {
  let component: CertificationComponent;
  let fixture: ComponentFixture<CertificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
