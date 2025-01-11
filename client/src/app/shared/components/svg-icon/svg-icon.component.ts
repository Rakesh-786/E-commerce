import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgIconService } from '../../services/svg-icon.service';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="svg-icon"
      [class]="cssClass"
      [style.width]="size"
      [style.height]="size"
      [innerHTML]="iconHtml">
    </span>
    <!-- Fallback for debugging -->
    <span *ngIf="!iconHtml" style="color: red; font-size: 12px;">{{name}}</span>
  `,
  styles: [`
    .svg-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
        fill: currentColor;
      }
    }

    .icon-sm {
      width: 16px;
      height: 16px;
    }

    .icon-md {
      width: 20px;
      height: 20px;
    }

    .icon-lg {
      width: 24px;
      height: 24px;
    }

    .icon-xl {
      width: 32px;
      height: 32px;
    }

    .icon-2xl {
      width: 40px;
      height: 40px;
    }

    /* Hover effects */
    .svg-icon:hover svg {
      transform: scale(1.1);
    }

    /* Animation classes */
    .animate-spin svg {
      animation: spin 1s linear infinite;
    }

    .animate-pulse svg {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-bounce svg {
      animation: bounce 1s infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
  `]
})
export class SvgIconComponent implements OnInit {
  @Input() name: string = 'help';
  @Input() size: string = '20px';
  @Input() cssClass: string = '';

  iconHtml: SafeHtml = '';

  constructor(
    private svgIconService: SvgIconService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.updateIcon();
  }

  ngOnChanges(): void {
    this.updateIcon();
  }

  private updateIcon(): void {
    const iconSvg = this.svgIconService.getIcon(this.name);
    this.iconHtml = this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }
}
