// lib/validators/IFieldValidator.ts
// Interface siguiendo Dependency Inversion Principle

import { ValidationResult } from './ValidationResult';

export interface IFieldValidator {
  validate(value: any, context?: any): Promise<ValidationResult>;
}

export interface IForeignKeyValidator extends IFieldValidator {
  validateForeignKey(id: any, tableName: string, allowNull?: boolean): Promise<ValidationResult>;
}
