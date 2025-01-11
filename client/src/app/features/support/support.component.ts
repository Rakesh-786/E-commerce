import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Customer Support" 
      description="Get help with your orders, account, or any questions you may have.">
    </app-placeholder>
  `
})
export class SupportComponent {}
