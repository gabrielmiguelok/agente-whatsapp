// lib/validators/ForeignKeyValidator.ts
// Validador de Foreign Keys robusto siguiendo Single Responsibility Principle

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { IForeignKeyValidator } from './IFieldValidator';
import { ValidationResult } from './ValidationResult';

export class ForeignKeyValidator implements IForeignKeyValidator {
  async validate(value: any, context?: { tableName?: string; allowNull?: boolean }): Promise<ValidationResult> {
    if (!context?.tableName) {
      return ValidationResult.failure('Tabla de referencia no especificada', 'MISSING_TABLE');
    }

    return this.validateForeignKey(value, context.tableName, context.allowNull);
  }

  async validateForeignKey(id: any, tableName: string, allowNull: boolean = false): Promise<ValidationResult> {
    // Si es null y se permite null, es válido
    if ((id === null || id === undefined || id === '') && allowNull) {
      return ValidationResult.success(null);
    }

    // Si es null y NO se permite, es inválido
    if (id === null || id === undefined || id === '') {
      return ValidationResult.failure(
        `El campo es requerido y no puede estar vacío`,
        'REQUIRED_FIELD'
      );
    }

    // Validar que sea un número válido
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return ValidationResult.failure(
        `ID inválido: debe ser un número positivo`,
        'INVALID_ID_FORMAT'
      );
    }

    // Validar que exista en la tabla referenciada
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM ${tableName} WHERE id = ? LIMIT 1`,
        [numericId]
      );

      if (rows.length === 0) {
        return ValidationResult.failure(
          `El registro con ID ${numericId} no existe en ${tableName}`,
          'FOREIGN_KEY_NOT_FOUND'
        );
      }

      return ValidationResult.success(numericId);
    } catch (error: any) {
      // Capturar errores de SQL (tabla no existe, permisos, etc.)
      return ValidationResult.failure(
        `Error al validar foreign key: ${error.message}`,
        'DATABASE_ERROR'
      );
    }
  }
}
