// lib/validators/FieldValidators.ts
// Validadores específicos por tipo de campo (Single Responsibility)

import { IFieldValidator } from './IFieldValidator';
import { ValidationResult } from './ValidationResult';

export class EmailValidator implements IFieldValidator {
  async validate(value: any): Promise<ValidationResult> {
    if (!value) return ValidationResult.success(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return ValidationResult.failure('Email inválido', 'INVALID_EMAIL');
    }

    return ValidationResult.success(value);
  }
}

export class PhoneValidator implements IFieldValidator {
  async validate(value: any): Promise<ValidationResult> {
    if (!value) return ValidationResult.success(null);

    // Formato flexible: acepta +54, espacios, guiones
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value)) {
      return ValidationResult.failure('Teléfono inválido', 'INVALID_PHONE');
    }

    return ValidationResult.success(value);
  }
}

export class NumericValidator implements IFieldValidator {
  constructor(
    private min?: number,
    private max?: number,
    private allowNull: boolean = true
  ) {}

  async validate(value: any): Promise<ValidationResult> {
    if ((value === null || value === undefined || value === '') && this.allowNull) {
      return ValidationResult.success(null);
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return ValidationResult.failure('Debe ser un número válido', 'INVALID_NUMBER');
    }

    if (this.min !== undefined && numValue < this.min) {
      return ValidationResult.failure(`Debe ser mayor o igual a ${this.min}`, 'MIN_VALUE');
    }

    if (this.max !== undefined && numValue > this.max) {
      return ValidationResult.failure(`Debe ser menor o igual a ${this.max}`, 'MAX_VALUE');
    }

    return ValidationResult.success(numValue);
  }
}

export class DateValidator implements IFieldValidator {
  async validate(value: any): Promise<ValidationResult> {
    if (!value) return ValidationResult.success(null);

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return ValidationResult.failure('Fecha inválida', 'INVALID_DATE');
    }

    return ValidationResult.success(date.toISOString().split('T')[0]);
  }
}

export class TextValidator implements IFieldValidator {
  constructor(
    private minLength?: number,
    private maxLength?: number,
    private allowEmpty: boolean = true
  ) {}

  async validate(value: any): Promise<ValidationResult> {
    if (!value && this.allowEmpty) {
      return ValidationResult.success(null);
    }

    const strValue = String(value);

    if (!this.allowEmpty && strValue.trim().length === 0) {
      return ValidationResult.failure('El campo no puede estar vacío', 'REQUIRED_FIELD');
    }

    if (this.minLength && strValue.length < this.minLength) {
      return ValidationResult.failure(
        `Debe tener al menos ${this.minLength} caracteres`,
        'MIN_LENGTH'
      );
    }

    if (this.maxLength && strValue.length > this.maxLength) {
      return ValidationResult.failure(
        `No puede exceder ${this.maxLength} caracteres`,
        'MAX_LENGTH'
      );
    }

    return ValidationResult.success(strValue);
  }
}

export class EnumValidator implements IFieldValidator {
  constructor(private allowedValues: string[], private allowNull: boolean = true) {}

  async validate(value: any): Promise<ValidationResult> {
    if ((value === null || value === undefined || value === '') && this.allowNull) {
      return ValidationResult.success(null);
    }

    if (!this.allowedValues.includes(value)) {
      return ValidationResult.failure(
        `Valor no permitido. Opciones válidas: ${this.allowedValues.join(', ')}`,
        'INVALID_ENUM'
      );
    }

    return ValidationResult.success(value);
  }
}
