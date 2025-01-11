import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Frequently Asked Questions" 
      description="Find answers to common questions about shopping, shipping, returns, and more.">
    </app-placeholder>
  `
})
export class FaqComponent {}
