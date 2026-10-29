import { Component, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-google-component',
  templateUrl: './auth-google-component.html',
})
export class AuthGoogleComponent {
  readonly loading = signal(false);
  
  protected async login(): Promise<void> {
    this.loading.set(true);
  }
}
