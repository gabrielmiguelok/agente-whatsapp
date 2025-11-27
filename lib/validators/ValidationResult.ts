// lib/validators/ValidationResult.ts
// Patrón Result para manejar validaciones de forma robusta

export type ValidationResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export class ValidationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Factory methods
export const ValidationResult = {
  success: <T>(data: T): ValidationResult<T> => ({ success: true, data }),
  failure: (error: string, code?: string): ValidationResult => ({ success: false, error, code }),
};
