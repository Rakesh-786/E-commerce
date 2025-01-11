import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoadImage]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoadImage!: string;
  @Input() placeholder: string = 'assets/images/placeholder-product.svg';

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    this.createObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver(): void {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    // Set placeholder initially
    this.el.nativeElement.src = this.placeholder;
    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = new Image();
    img.onload = () => {
      this.el.nativeElement.src = this.appLazyLoadImage;
      this.el.nativeElement.classList.add('loaded');
    };
    img.onerror = () => {
      this.el.nativeElement.src = this.placeholder;
      this.el.nativeElement.classList.add('error');
    };
    img.src = this.appLazyLoadImage;
  }
}
