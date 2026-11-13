import { Component, computed, inject, signal } from '@angular/core';
import { AuthGoogleComponent } from '@features/auth/components/auth-google-component/auth-google-component';
import { AuthGithubComponent } from '@features/auth/components/auth-github-component/auth-github-component';
import { AuthAppleComponent } from '@features/auth/components/auth-apple-component/auth-apple-component';
import { AuthLoginComponent } from '@features/auth/components/auth-login-component/auth-login-component';
import { AuthService } from '@core/services/auth-service';
import { ErrorService } from '@core/services/error-service';
import { ToastService } from '@core/services/toast-service';

type AuthProvider = 'google' | 'github' | 'apple' | 'credentials';

@Component({
  imports: [AuthGoogleComponent, AuthGithubComponent, AuthAppleComponent, AuthLoginComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {
  private readonly authService = inject(AuthService);
  private readonly errorService = inject(ErrorService);
  private readonly toastService = inject(ToastService);

  protected readonly busy = signal<AuthProvider | null>(null);
  protected readonly disabled = computed(() => this.busy() !== null);

  protected isBusy(provider: AuthProvider): boolean {
    return this.busy() === provider;
  }

  protected loginGoogle(): Promise<void> {
    return this.run('google', () => this.authService.loginWithGoogle());
  }

  protected loginGitHub(): Promise<void> {
    return this.run('github');
  }

  protected loginApple(): Promise<void> {
    return this.run('apple');
  }

  protected loginAuth(): Promise<void> {
    return this.run('credentials');
  }

  // Solo Google tiene backend. Los demás avisan en vez de comer el click.
  private async run(provider: AuthProvider, action?: () => Promise<void>): Promise<void> {
    if (this.busy()) return;

    if (!action) {
      this.toastService.show('Disponible próximamente', 'info');
      return;
    }

    this.busy.set(provider);
    try {
      await action();
    } catch (error) {
      this.errorService.show(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      this.busy.set(null);
    }
  }
}
