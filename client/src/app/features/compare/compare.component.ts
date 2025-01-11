import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Compare Products" 
      description="Compare features, prices, and specifications of your selected products side by side.">
    </app-placeholder>
  `
})
export class CompareComponent {}
