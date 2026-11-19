import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserDetailsComponent } from './user-details-component';
import { UserProfile } from '@core/models/auth-profile';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  const baseProfile: UserProfile = {
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
    fixture.componentRef.setInput('userProfile', baseProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display full name (name + lastname)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ada Lovelace');
  });

  it('should fall back to email when name is null', async () => {
    fixture.componentRef.setInput('userProfile', { ...baseProfile, name: null, lastname: null });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ada@example.com');
  });

  it('should fall back to "Usuario" when name and email are null', async () => {
    fixture.componentRef.setInput('userProfile', { ...baseProfile, name: null, lastname: null, email: null });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Usuario');
  });

  it('should use picture_url when provided', () => {
    fixture.componentRef.setInput('userProfile', { ...baseProfile, picture_url: 'https://example.com/pic.jpg' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img?.getAttribute('ngsrc') || img?.src).toContain('pic.jpg');
  });

  it('should fall back to /images/user.png when picture_url is null', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img?.getAttribute('ngsrc') || img?.src).toContain('user.png');
  });

  it('should display role and provider', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('rol: admin');
    expect(el.textContent).toContain('auth: google');
  });

  it('should display "Sin Roll" when role is null', async () => {
    fixture.componentRef.setInput('userProfile', { ...baseProfile, role: null });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin Roll');
  });

  it('should display "Sin Proveedor" when provider is null', async () => {
    fixture.componentRef.setInput('userProfile', { ...baseProfile, provider: null });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin Proveedor');
  });

  it('should emit logout event on button click', () => {
    const spy = vi.fn();
    component.logout.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn?.click();
    expect(spy).toHaveBeenCalled();
  });
});
