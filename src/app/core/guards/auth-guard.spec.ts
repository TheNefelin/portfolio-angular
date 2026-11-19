import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';
import { SessionService } from '@core/services/session-service';
import { of } from 'rxjs';

describe('authGuard', () => {
  let sessionSpy: { getUser: ReturnType<typeof vi.fn> };

  const adminUser = { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', status: 'activo', is_active: true };
  const regularUser = { id: '2', email: 'user@test.com', name: 'User', role: 'user', status: 'activo', is_active: true };

  beforeEach(() => {
    sessionSpy = { getUser: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionSpy },
      ],
    });
  });

  function runGuard(role?: 'admin' | 'user') {
    const guard = TestBed.runInInjectionContext(() => authGuard(role));
    return TestBed.runInInjectionContext(() => {
      // CanActivateFn signature: (route, state) => Observable<boolean | UrlTree>
      return (guard as unknown as (r: null, s: null) => { subscribe: (cb: (v: unknown) => void) => void })(null, null);
    });
  }

  it('should redirect to /auth when no session', () => {
    sessionSpy.getUser.mockReturnValue(of(null));
    let resolved: unknown;
    runGuard().subscribe((v: unknown) => (resolved = v));
    expect((resolved as UrlTree).toString()).toContain('/auth');
  });

  it('should allow access for admin role', () => {
    sessionSpy.getUser.mockReturnValue(of(adminUser));
    let resolved: unknown;
    runGuard('admin').subscribe((v: unknown) => (resolved = v));
    expect(resolved).toBe(true);
  });

  it('should redirect to /forbidden for non-admin role on admin guard', () => {
    sessionSpy.getUser.mockReturnValue(of(regularUser));
    let resolved: unknown;
    runGuard('admin').subscribe((v: unknown) => (resolved = v));
    expect((resolved as UrlTree).toString()).toContain('/forbidden');
  });

  it('should allow access for any authenticated user when no role specified', () => {
    sessionSpy.getUser.mockReturnValue(of(regularUser));
    let resolved: unknown;
    runGuard().subscribe((v: unknown) => (resolved = v));
    expect(resolved).toBe(true);
  });

  it('should call getUser() without force', () => {
    sessionSpy.getUser.mockReturnValue(of(adminUser));
    runGuard('admin').subscribe(() => { /* noop */ });
    expect(sessionSpy.getUser).toHaveBeenCalledWith();
  });
});
