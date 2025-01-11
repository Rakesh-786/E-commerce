import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface AppError {
  message: string;
  status?: number;
  timestamp: Date;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errors: AppError[] = [];

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }

    const appError: AppError = {
      message: errorMessage,
      status: error.status,
      timestamp: new Date(),
      url: error.url || undefined
    };

    this.logError(appError);
    return throwError(() => appError);
  }

  private logError(error: AppError): void {
    this.errors.push(error);
    console.error('Application Error:', error);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}
