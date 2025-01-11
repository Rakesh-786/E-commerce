import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Search Results" 
      description="Find exactly what you're looking for with our advanced search functionality.">
    </app-placeholder>
  `
})
export class SearchComponent {}
