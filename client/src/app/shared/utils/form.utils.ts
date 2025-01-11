import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { VALIDATION_PATTERNS } from '../constants/validation.constants';

export class FormUtils {
  /**
   * Custom validator for email format
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = VALIDATION_PATTERNS.EMAIL.test(control.value);
      return valid ? null : { email: true };
    };
  }

  /**
   * Custom validator for password strength
   */
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = VALIDATION_PATTERNS.PASSWORD.test(control.value);
      return valid ? null : { password: true };
    };
  }

  /**
   * Custom validator for phone number
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = VALIDATION_PATTERNS.PHONE.test(control.value);
      return valid ? null : { phone: true };
    };
  }

  /**
   * Custom validator for confirming password
   */
  static confirmPasswordValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      const password = control.parent.get(passwordField);
      const confirmPassword = control;
      
      if (!password || !confirmPassword) {
        return null;
      }
      
      if (password.value !== confirmPassword.value) {
        return { confirmPassword: true };
      }
      
      return null;
    };
  }

  /**
   * Mark all fields in a form as touched
   */
  static markFormGroupTouched(formGroup: AbstractControl): void {
    Object.keys(formGroup.value).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control.value && typeof control.value === 'object') {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  /**
   * Get error message for a form control
   */
  static getErrorMessage(control: AbstractControl, fieldName: string = 'Field'): string {
    if (!control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${fieldName} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['password']) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (errors['phone']) {
      return 'Please enter a valid phone number';
    }
    if (errors['confirmPassword']) {
      return 'Passwords do not match';
    }
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${fieldName} cannot exceed ${errors['max'].max}`;
    }
    if (errors['pattern']) {
      return `${fieldName} format is invalid`;
    }

    return `${fieldName} is invalid`;
  }
}
