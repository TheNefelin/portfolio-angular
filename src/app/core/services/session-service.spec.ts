import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SessionService } from './session-service';
import { AuthService } from './auth-service';
import { UserProfile } from '@core/models/auth-profile';

describe('SessionService', () => {
  let service: SessionService;
  let authSpy: { me: ReturnType<typeof vi.fn> };

  const mockUser: UserProfile = {
    id: '1',
    email: 'test@example.com',
    name: 'Test',
    lastname: 'User',
    picture_url: null,
    email_verified: true,
    is_active: true,
    role: 'admin',
    status: 'activo',
    provider: 'google',
  };

  beforeEach(() => {
    authSpy = { me: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: AuthService, useValue: authSpy },
      ],
    });
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUser() should fetch from AuthService on first call', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    service.getUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    expect(authSpy.me).toHaveBeenCalledTimes(1);
  });

  it('getUser() should cache and not re-fetch on subsequent calls', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    service.getUser().subscribe();
    service.getUser().subscribe();
    service.getUser().subscribe();

    expect(authSpy.me).toHaveBeenCalledTimes(1);
  });

  it('getUser() should return cached value on second call', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    let firstResult: UserProfile | null = null;
    let secondResult: UserProfile | null = null;

    service.getUser().subscribe((u) => (firstResult = u));
    service.getUser().subscribe((u) => (secondResult = u));

    expect(firstResult).toEqual(mockUser);
    expect(secondResult).toEqual(mockUser);
  });

  it('getUser(force=true) should re-fetch even if cached', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    service.getUser().subscribe();
    service.getUser(true).subscribe();

    expect(authSpy.me).toHaveBeenCalledTimes(2);
  });

  it('getUser() should return null on API error (401)', () => {
    authSpy.me.mockReturnValue(throwError(() => new Error('401 Unauthorized')));

    service.getUser().subscribe((user) => {
      expect(user).toBeNull();
    });
  });

  it('getUser() should cache null result (no re-fetch after failed attempt)', () => {
    authSpy.me.mockReturnValue(throwError(() => new Error('401')));

    service.getUser().subscribe();
    service.getUser().subscribe();

    expect(authSpy.me).toHaveBeenCalledTimes(1);
  });

  it('clear() should reset the cached user to null', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    service.getUser().subscribe();
    expect(service.user()).toEqual(mockUser);

    service.clear();
    expect(service.user()).toBeNull();
  });

  it('clear() should return null without re-fetching', () => {
    authSpy.me.mockReturnValue(of(mockUser));

    service.getUser().subscribe();
    service.clear();
    service.getUser().subscribe();

    // After clear(), _user is null (checked, no session) → no re-fetch
    expect(authSpy.me).toHaveBeenCalledTimes(1);
    expect(service.user()).toBeNull();
  });

  it('user signal should start as null', () => {
    expect(service.user()).toBeNull();
  });
});
