import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfile } from '@core/models/auth-profile';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  imports: [RouterLink, NgOptimizedImage],
  selector: 'app-user-details-component',
  templateUrl: './user-details-component.html',
})
export class UserDetailsComponent {
  protected readonly routes = ROUTES_CONSTANTS;

  readonly userProfile = input.required<UserProfile>();
  readonly logout = output<void>();

  protected readonly displayName = computed(() => {
    const fullName = [this.userProfile().name, this.userProfile().lastname]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || this.userProfile().email || 'Usuario';
  });
  
  protected readonly initial = computed(
    () => this.displayName().trim().charAt(0).toUpperCase() || '?',
  );

  protected readonly pictureUrl = computed(
    () => this.userProfile().picture_url || '/images/user.png',
  );
}
