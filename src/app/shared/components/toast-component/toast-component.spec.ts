import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '@core/services/toast-service';
import { ToastComponent } from './toast-component';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    toastService = TestBed.inject(ToastService);
    await fixture.whenStable();
  });

  it('muestra los toasts del servicio', async () => {
    toastService.show('Guardado');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Guardado');
  });

  it('quita el toast al cerrarlo', async () => {
    toastService.show('Guardado');
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Guardado');
  });
});
