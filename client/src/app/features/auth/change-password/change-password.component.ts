import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../placeholder/placeholder.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Change Password" 
      description="Update your account password for enhanced security.">
    </app-placeholder>
  `
})
export class ChangePasswordComponent {}
