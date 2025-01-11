import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;

  get fullStars(): number[] {
    const fullStarsCount = Math.floor(this.rating);
    return Array(fullStarsCount).fill(0);
  }

  get hasHalfStar(): boolean {
    return this.rating % 1 >= 0.5;
  }

  get emptyStars(): number[] {
    const emptyStarsCount = Math.floor(this.maxRating - this.rating);
    return Array(emptyStarsCount).fill(0);
  }
}
