import { Component, inject } from '@angular/core';
import { ConfirmService } from '@core/services/confirm-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-modal-confirm-component',
  templateUrl: './modal-confirm-component.html',
})
export class ModalConfirmComponent {
  protected readonly confirmService = inject(ConfirmService);
}
