import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserDetailsComponent } from './user-details-component';
import { UserProfile } from '@features/auth/models/auth-profile';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  const userProfile: UserProfile = {
    id: '1',
    email: 'ada@example.com',
    name: 'Ada',
    lastname: 'Lovelace',
    picture_url: null,
    email_verified: true,
    is_active: true,
    role: 'admin',
    status: 'activo',
    provider: 'google',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    // `userProfile` es un input requerido: sin valor el render falla con NG0950.
    fixture.componentRef.setInput('userProfile', userProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
