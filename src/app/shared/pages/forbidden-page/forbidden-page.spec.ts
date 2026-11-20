import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ForbiddenPage } from './forbidden-page';
import { SessionService } from '@core/services/session-service';
import { AuthService } from '@core/services/auth-service';

describe('ForbiddenPage', () => {
  let component: ForbiddenPage;
  let fixture: ComponentFixture<ForbiddenPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForbiddenPage],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: { getUser: () => of(null), user: () => null, clear: () => { /* noop */ } } },
        { provide: AuthService, useValue: { logout: () => of({ status: 'ok' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForbiddenPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
