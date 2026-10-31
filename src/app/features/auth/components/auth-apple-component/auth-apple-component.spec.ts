import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthAppleComponent } from './auth-apple-component';

describe('AuthAppleComponent', () => {
  let component: AuthAppleComponent;
  let fixture: ComponentFixture<AuthAppleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthAppleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthAppleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
