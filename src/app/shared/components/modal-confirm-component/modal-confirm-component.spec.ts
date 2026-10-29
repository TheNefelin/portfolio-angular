import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService } from '@core/services/confirm-service';
import { ModalConfirmComponent } from './modal-confirm-component';

describe('ModalConfirmComponent', () => {
  let component: ModalConfirmComponent;
  let fixture: ComponentFixture<ModalConfirmComponent>;
  let confirmService: ConfirmService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfirmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfirmComponent);
    component = fixture.componentInstance;
    confirmService = TestBed.inject(ConfirmService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resuelve true al confirmar', async () => {
    const pending = confirmService.confirm({ title: 'Eliminar', message: '¿Seguro?' });
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('button')[0].click();

    await expect(pending).resolves.toBe(true);
  });

  it('resuelve false al cancelar', async () => {
    const pending = confirmService.confirm({ title: 'Eliminar', message: '¿Seguro?' });
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('button')[1].click();

    await expect(pending).resolves.toBe(false);
  });
});
