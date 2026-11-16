import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details-component';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  const profile = {
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
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    // `profile` es un input requerido: sin valor el render falla con NG0950.
    fixture.componentRef.setInput('profile', profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
