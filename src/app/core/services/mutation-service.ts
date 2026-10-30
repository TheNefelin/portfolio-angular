import { inject, Service, WritableSignal } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { ToastService } from "@core/services/toast-service";

interface MutationOptions {
  successMsg: string;
  errorMsg: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onFinalize?: () => void;
}

@Service()
export class MutationService {
  private readonly toastService = inject(ToastService);

  run<T>(
    action: Observable<T>,
    state: { isSaving: WritableSignal<boolean> },
    options: MutationOptions,
  ): void {
    let succeeded = false;
    state.isSaving.set(true);
    action.pipe(
      finalize(() => {
        state.isSaving.set(false);
        if (succeeded) options.onClose?.();
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        succeeded = true;
        this.toastService.show(options.successMsg);
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[${options.errorMsg}]:`, err);
      }
    });
  }
}