import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Returns & Exchanges" 
      description="Information about our return policy, exchange process, and refund procedures.">
    </app-placeholder>
  `
})
export class ReturnsComponent {}
