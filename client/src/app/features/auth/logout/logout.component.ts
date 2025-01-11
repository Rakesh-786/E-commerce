import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="logout-container">
      <div class="logout-card">
        <div class="logout-icon">
          <i class="fa-solid fa-sign-out-alt"></i>
        </div>
        <h1 class="logout-title">Signing Out...</h1>
        <p class="logout-message">
          Thank you for using MarketMingle. You are being signed out securely.
        </p>
        <div class="logout-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .logout-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      padding: 3rem 2rem;
      text-align: center;
      animation: slideInUp 0.6s ease-out;
    }

    .logout-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
      box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
    }

    .logout-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }

    .logout-message {
      color: #666;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 2rem;
    }

    .logout-spinner {
      font-size: 2rem;
      color: #667eea;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .logout-container {
        padding: 1rem;
      }
      
      .logout-card {
        padding: 2rem 1.5rem;
      }
      
      .logout-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Perform logout after a short delay for better UX
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }
}
