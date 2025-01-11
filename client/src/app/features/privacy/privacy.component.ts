import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Privacy Policy" 
      description="Learn how we protect your privacy and handle your personal information.">
    </app-placeholder>
  `
})
export class PrivacyComponent {}
