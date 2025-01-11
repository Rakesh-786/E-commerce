export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (min: number) => `Minimum length is ${min} characters`,
  MAX_LENGTH: (max: number) => `Maximum length is ${max} characters`,
  MIN_VALUE: (min: number) => `Minimum value is ${min}`,
  MAX_VALUE: (max: number) => `Maximum value is ${max}`,
  PATTERN: 'Invalid format',
  CONFIRM_PASSWORD: 'Passwords do not match'
} as const;

export const FIELD_LIMITS = {
  NAME: { MIN: 2, MAX: 50 },
  EMAIL: { MAX: 100 },
  PASSWORD: { MIN: 8, MAX: 128 },
  PHONE: { MIN: 10, MAX: 15 },
  DESCRIPTION: { MAX: 500 },
  TITLE: { MAX: 100 },
  ADDRESS: { MAX: 200 },
  CITY: { MAX: 50 },
  STATE: { MAX: 50 },
  ZIP_CODE: { MAX: 10 },
  BUSINESS_NAME: { MIN: 2, MAX: 100 }
} as const;
