import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h1 class="placeholder-title">{{ title }}</h1>
        <p class="placeholder-description">{{ description }}</p>
        <div class="placeholder-actions">
          <button class="btn btn-primary" routerLink="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Back to Home
          </button>
          <button class="btn btn-secondary" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .placeholder-content {
      text-align: center;
      max-width: 500px;
      background: white;
      padding: 3rem 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .placeholder-icon {
      color: #6366f1;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
    }

    .placeholder-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .placeholder-description {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .placeholder-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover {
      background: #5856eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }

    @media (max-width: 640px) {
      .placeholder-content {
        padding: 2rem 1rem;
      }
      
      .placeholder-title {
        font-size: 1.5rem;
      }
      
      .placeholder-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class PlaceholderComponent {
  @Input() title: string = 'Coming Soon';
  @Input() description: string = 'This feature is currently under development. We\'re working hard to bring you an amazing experience!';

  goBack() {
    window.history.back();
  }
}
