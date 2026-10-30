import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalConfirmComponent } from '@shared/components/modal-confirm-component/modal-confirm-component';
import { ModalErrorComponent } from '@shared/components/modal-error-component/modal-error-component';
import { ToastComponent } from '@shared/components/toast-component/toast-component';

@Component({
  imports: [RouterOutlet, ModalErrorComponent, ModalConfirmComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Portfolio');
}
