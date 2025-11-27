// lib/validators/TableFieldValidator.ts
// Orquestador de validaciones por tabla (Open/Closed Principle)

import { IFieldValidator } from './IFieldValidator';
import { ValidationResult } from './ValidationResult';
import { ForeignKeyValidator } from './ForeignKeyValidator';
import {
  EmailValidator,
  PhoneValidator,
  NumericValidator,
  DateValidator,
  TextValidator,
  EnumValidator,
} from './FieldValidators';

type FieldValidationRule = {
  validators: IFieldValidator[];
  context?: any;
};

export class TableFieldValidator {
  private validators: Map<string, Map<string, FieldValidationRule>> = new Map();
  private fkValidator = new ForeignKeyValidator();

  constructor() {
    this.initializeValidators();
  }

  private initializeValidators() {
    // ==================== REVENDEDORES ====================
    this.validators.set('revendedores', new Map([
      ['nombre', {
        validators: [new TextValidator(2, 200, false)],
      }],
      ['telefono', {
        validators: [new PhoneValidator()],
      }],
      ['email', {
        validators: [new EmailValidator()],
      }],
      ['fecha_alta', {
        validators: [new DateValidator()],
      }],
    ]));

    // ==================== CLIENTES ====================
    this.validators.set('clientes', new Map([
      ['nombre', {
        validators: [new TextValidator(2, 200, false)],
      }],
      ['telefono', {
        validators: [new PhoneValidator()],
      }],
      ['email', {
        validators: [new EmailValidator()],
      }],
      ['fecha', {
        validators: [new DateValidator()],
      }],
      ['responsable_id', {
        validators: [this.fkValidator],
        context: { tableName: 'revendedores', allowNull: true },
      }],
    ]));

    // ==================== SUCURSALES ====================
    const provinciasArgentinas = [
      'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
      'Entre Ríos', 'Formosa', 'Jujuy', 'La Rioja', 'Mendoza', 'Misiones',
      'Neuquén', 'Río Negro', 'Salta', 'Santa Fe', 'Santiago del Estero', 'Tucumán',
    ];

    this.validators.set('sucursales', new Map([
      ['cliente_id', {
        validators: [this.fkValidator],
        context: { tableName: 'clientes', allowNull: false },
      }],
      ['provincia', {
        validators: [new EnumValidator(provinciasArgentinas, false)],
      }],
      ['localidad', {
        validators: [new TextValidator(2, 100, false)],
      }],
      ['domicilio', {
        validators: [new TextValidator(5, 300, false)],
      }],
      ['responsable_id', {
        validators: [this.fkValidator],
        context: { tableName: 'revendedores', allowNull: true },
      }],
      ['despachante_id', {
        validators: [this.fkValidator],
        context: { tableName: 'revendedores', allowNull: true },
      }],
    ]));

    // ==================== OPERACIONES_COMPRA ====================
    const proveedoresPermitidos = [
      'AudioPro', 'CompuPartes', 'ElectroMax', 'ImportDirect',
      'Mercado Mayorista', 'MueblesOficina', 'Papelera Central', 'TechStore SA',
    ];

    this.validators.set('operaciones_compra', new Map([
      ['fecha', {
        validators: [new DateValidator()],
      }],
      ['producto', {
        validators: [new TextValidator(3, 300, false)],
      }],
      ['proveedor', {
        validators: [new EnumValidator(proveedoresPermitidos, false)],
      }],
      ['unidades', {
        validators: [new NumericValidator(1, 1000000, false)],
      }],
      ['precio_unitario', {
        validators: [new NumericValidator(0, 999999999, false)],
      }],
      ['con_iva', {
        validators: [new EnumValidator(['0', '1'], false)],
      }],
      ['porcentaje_iva', {
        validators: [new NumericValidator(0, 30, false)],
      }],
      ['costo_variable_porcentaje', {
        validators: [new NumericValidator(0, 999.99, false)],
      }],
      ['observaciones', {
        validators: [new TextValidator(0, 500, true)],
      }],
    ]));
  }

  async validateField(tableName: string, fieldName: string, value: any): Promise<ValidationResult> {
    const tableValidators = this.validators.get(tableName);
    if (!tableValidators) {
      return ValidationResult.failure(
        `Tabla ${tableName} no tiene validadores configurados`,
        'UNKNOWN_TABLE'
      );
    }

    const fieldRule = tableValidators.get(fieldName);
    if (!fieldRule) {
      return ValidationResult.failure(
        `Campo ${fieldName} no es editable o no existe en ${tableName}`,
        'FIELD_NOT_EDITABLE'
      );
    }

    // Ejecutar todos los validadores para este campo
    for (const validator of fieldRule.validators) {
      const result = await validator.validate(value, fieldRule.context);
      if (!result.success) {
        return result;
      }
    }

    return ValidationResult.success(value);
  }

  getAllowedFields(tableName: string): string[] {
    const tableValidators = this.validators.get(tableName);
    if (!tableValidators) return [];
    return Array.from(tableValidators.keys());
  }
}
