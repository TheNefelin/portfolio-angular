import { Component } from '@angular/core';
import { AuthGoogleComponent } from '@features/auth/components/auth-google-component/auth-google-component';

@Component({
  imports: [AuthGoogleComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {}
