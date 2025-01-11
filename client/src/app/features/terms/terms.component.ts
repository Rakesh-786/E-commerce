import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Terms of Service" 
      description="Read our terms and conditions for using the MarketMingle platform.">
    </app-placeholder>
  `
})
export class TermsComponent {}
