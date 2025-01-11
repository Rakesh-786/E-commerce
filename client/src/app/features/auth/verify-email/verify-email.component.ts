import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../placeholder/placeholder.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Email Verification" 
      description="Verify your email address to activate your account and access all features.">
    </app-placeholder>
  `
})
export class VerifyEmailComponent {}
