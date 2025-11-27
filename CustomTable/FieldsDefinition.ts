import type { FieldsDefinition } from './CustomTableColumnsConfig';

// Definición de campos base para ejemplo de tabla.
const fieldsDefinition: FieldsDefinition = {
  nombre:   { type: 'text',    header: 'NOMBRE COMPLETO',   width: 180 },
  telefono: { type: 'text',    header: 'TELÉFONO',          width: 120 },
  ciudad:   { type: 'text',    header: 'CIUDAD',            width: 100 },
  pais:     { type: 'text',    header: 'PAÍS',              width: 100 },
  edad:     { type: 'numeric', header: 'EDAD',              width: 80  },
  likes:    { type: 'numeric', header: 'LIKES',             width: 80  },
  maps_url: { type: 'link',    header: 'UBICACIÓN (Maps)',  width: 200 },
};

export default fieldsDefinition;
