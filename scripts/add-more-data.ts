// scripts/add-more-data.ts
// Script para agregar más datos a la base de datos

import pool from '../lib/db';

// Más datos de ventas (35 adicionales para llegar a 40+)
const additionalSales = [
  { cliente_nombre: 'Industrias Del Valle', producto: 'Servicio Premium', monto: 22000, cantidad: 5, fecha_venta: '2024-01-28', vendedor_nombre: 'Pedro Fernández', region: 'Norte', estado: 'Completado', satisfaccion: 4.9, empleado_id: 6 },
  { cliente_nombre: 'Tech Innovations', producto: 'Plan Avanzado', monto: 12000, cantidad: 8, fecha_venta: '2024-02-02', vendedor_nombre: 'Sofia Torres', region: 'Sur', estado: 'Completado', satisfaccion: 4.6, empleado_id: 7 },
  { cliente_nombre: 'Digital Solutions SA', producto: 'Servicio Enterprise', monto: 28000, cantidad: 2, fecha_venta: '2024-02-05', vendedor_nombre: 'Diego Ramírez', region: 'Este', estado: 'En Proceso', satisfaccion: 4.7, empleado_id: 8 },
  { cliente_nombre: 'Consultora Premium', producto: 'Plan Básico', monto: 4500, cantidad: 9, fecha_venta: '2024-02-08', vendedor_nombre: 'Andrés Morales', region: 'Oeste', estado: 'Completado', satisfaccion: 4.3, empleado_id: 10 },
  { cliente_nombre: 'Grupo Empresarial XYZ', producto: 'Servicio Premium', monto: 19500, cantidad: 4, fecha_venta: '2024-02-12', vendedor_nombre: 'Carmen Ortiz', region: 'Centro', estado: 'Completado', satisfaccion: 4.8, empleado_id: 13 },
  { cliente_nombre: 'Corporación Global', producto: 'Servicio Enterprise', monto: 31000, cantidad: 1, fecha_venta: '2024-02-15', vendedor_nombre: 'Gabriela Romero', region: 'Norte', estado: 'Completado', satisfaccion: 5.0, empleado_id: 19 },
  { cliente_nombre: 'Finanzas Express', producto: 'Plan Avanzado', monto: 13500, cantidad: 7, fecha_venta: '2024-02-18', vendedor_nombre: 'Natalia Medina', region: 'Sur', estado: 'Pendiente', satisfaccion: 4.0, empleado_id: 25 },
  { cliente_nombre: 'Marketing Plus', producto: 'Plan Básico', monto: 3800, cantidad: 11, fecha_venta: '2024-02-22', vendedor_nombre: 'María López', region: 'Este', estado: 'Completado', satisfaccion: 4.4, empleado_id: 3 },
  { cliente_nombre: 'Innovatech', producto: 'Servicio Premium', monto: 20000, cantidad: 6, fecha_venta: '2024-02-25', vendedor_nombre: 'Ana García', region: 'Oeste', estado: 'En Proceso', satisfaccion: 4.5, empleado_id: 1 },
  { cliente_nombre: 'Sistemas Integrados', producto: 'Plan Avanzado', monto: 11000, cantidad: 10, fecha_venta: '2024-03-01', vendedor_nombre: 'Carlos Rodríguez', region: 'Centro', estado: 'Completado', satisfaccion: 4.2, empleado_id: 2 },
  { cliente_nombre: 'DataCorp', producto: 'Servicio Enterprise', monto: 27500, cantidad: 3, fecha_venta: '2024-03-05', vendedor_nombre: 'Juan Martínez', region: 'Norte', estado: 'Completado', satisfaccion: 4.9, empleado_id: 4 },
  { cliente_nombre: 'CloudTech SA', producto: 'Servicio Premium', monto: 16500, cantidad: 5, fecha_venta: '2024-03-08', vendedor_nombre: 'Laura Sánchez', region: 'Sur', estado: 'Pendiente', satisfaccion: 3.8, empleado_id: 5 },
  { cliente_nombre: 'E-Business Group', producto: 'Plan Básico', monto: 4200, cantidad: 12, fecha_venta: '2024-03-12', vendedor_nombre: 'Andrés Morales', region: 'Este', estado: 'Completado', satisfaccion: 4.6, empleado_id: 10 },
  { cliente_nombre: 'Retail Masters', producto: 'Plan Avanzado', monto: 14000, cantidad: 6, fecha_venta: '2024-03-15', vendedor_nombre: 'Carmen Ortiz', region: 'Oeste', estado: 'En Proceso', satisfaccion: 4.4, empleado_id: 13 },
  { cliente_nombre: 'Software House', producto: 'Servicio Enterprise', monto: 29000, cantidad: 2, fecha_venta: '2024-03-18', vendedor_nombre: 'Diego Ramírez', region: 'Centro', estado: 'Completado', satisfaccion: 4.8, empleado_id: 8 },
  { cliente_nombre: 'Mobile Solutions', producto: 'Servicio Premium', monto: 18000, cantidad: 7, fecha_venta: '2024-03-22', vendedor_nombre: 'Gabriela Romero', region: 'Norte', estado: 'Completado', satisfaccion: 4.7, empleado_id: 19 },
  { cliente_nombre: 'AI Consulting', producto: 'Plan Avanzado', monto: 12500, cantidad: 8, fecha_venta: '2024-03-25', vendedor_nombre: 'Natalia Medina', region: 'Sur', estado: 'Completado', satisfaccion: 4.5, empleado_id: 25 },
  { cliente_nombre: 'Web Developers Inc', producto: 'Plan Básico', monto: 3500, cantidad: 15, fecha_venta: '2024-03-28', vendedor_nombre: 'Ana García', region: 'Este', estado: 'Pendiente', satisfaccion: 3.9, empleado_id: 1 },
  { cliente_nombre: 'Security First', producto: 'Servicio Enterprise', monto: 32000, cantidad: 1, fecha_venta: '2024-04-02', vendedor_nombre: 'Pedro Fernández', region: 'Oeste', estado: 'Completado', satisfaccion: 5.0, empleado_id: 6 },
  { cliente_nombre: 'Analytics Pro', producto: 'Servicio Premium', monto: 21000, cantidad: 4, fecha_venta: '2024-04-05', vendedor_nombre: 'María López', region: 'Centro', estado: 'En Proceso', satisfaccion: 4.6, empleado_id: 3 },
  { cliente_nombre: 'Digital Marketing Hub', producto: 'Plan Avanzado', monto: 13000, cantidad: 9, fecha_venta: '2024-04-08', vendedor_nombre: 'Sofia Torres', region: 'Norte', estado: 'Completado', satisfaccion: 4.3, empleado_id: 7 },
  { cliente_nombre: 'Enterprise Solutions', producto: 'Servicio Enterprise', monto: 30000, cantidad: 2, fecha_venta: '2024-04-12', vendedor_nombre: 'Juan Martínez', region: 'Sur', estado: 'Completado', satisfaccion: 4.9, empleado_id: 4 },
  { cliente_nombre: 'StartUp Accelerator', producto: 'Plan Básico', monto: 4800, cantidad: 10, fecha_venta: '2024-04-15', vendedor_nombre: 'Carlos Rodríguez', region: 'Este', estado: 'Pendiente', satisfaccion: 4.1, empleado_id: 2 },
  { cliente_nombre: 'Business Intelligence SA', producto: 'Servicio Premium', monto: 17500, cantidad: 6, fecha_venta: '2024-04-18', vendedor_nombre: 'Diego Ramírez', region: 'Oeste', estado: 'Completado', satisfaccion: 4.7, empleado_id: 8 },
  { cliente_nombre: 'Cloud Experts', producto: 'Plan Avanzado', monto: 11500, cantidad: 11, fecha_venta: '2024-04-22', vendedor_nombre: 'Laura Sánchez', region: 'Centro', estado: 'En Proceso', satisfaccion: 4.2, empleado_id: 5 },
  { cliente_nombre: 'Tech Leaders', producto: 'Servicio Enterprise', monto: 28500, cantidad: 3, fecha_venta: '2024-04-25', vendedor_nombre: 'Andrés Morales', region: 'Norte', estado: 'Completado', satisfaccion: 4.8, empleado_id: 10 },
  { cliente_nombre: 'Innovation Labs', producto: 'Servicio Premium', monto: 19000, cantidad: 5, fecha_venta: '2024-04-28', vendedor_nombre: 'Carmen Ortiz', region: 'Sur', estado: 'Completado', satisfaccion: 4.6, empleado_id: 13 },
  { cliente_nombre: 'Digital Ventures', producto: 'Plan Básico', monto: 3900, cantidad: 13, fecha_venta: '2024-05-02', vendedor_nombre: 'Gabriela Romero', region: 'Este', estado: 'Completado', satisfaccion: 4.4, empleado_id: 19 },
  { cliente_nombre: 'Smart Systems', producto: 'Plan Avanzado', monto: 12800, cantidad: 7, fecha_venta: '2024-05-05', vendedor_nombre: 'Natalia Medina', region: 'Oeste', estado: 'Pendiente', satisfaccion: 4.0, empleado_id: 25 },
  { cliente_nombre: 'Automation Corp', producto: 'Servicio Enterprise', monto: 31500, cantidad: 1, fecha_venta: '2024-05-08', vendedor_nombre: 'Ana García', region: 'Centro', estado: 'Completado', satisfaccion: 5.0, empleado_id: 1 },
  { cliente_nombre: 'Growth Partners', producto: 'Servicio Premium', monto: 20500, cantidad: 4, fecha_venta: '2024-05-12', vendedor_nombre: 'Pedro Fernández', region: 'Norte', estado: 'En Proceso', satisfaccion: 4.5, empleado_id: 6 },
  { cliente_nombre: 'Strategy Consultants', producto: 'Plan Avanzado', monto: 13200, cantidad: 8, fecha_venta: '2024-05-15', vendedor_nombre: 'María López', region: 'Sur', estado: 'Completado', satisfaccion: 4.7, empleado_id: 3 },
  { cliente_nombre: 'Performance Analytics', producto: 'Plan Básico', monto: 4100, cantidad: 14, fecha_venta: '2024-05-18', vendedor_nombre: 'Sofia Torres', region: 'Este', estado: 'Completado', satisfaccion: 4.3, empleado_id: 7 },
  { cliente_nombre: 'Quality Assurance Ltd', producto: 'Servicio Enterprise', monto: 29500, cantidad: 2, fecha_venta: '2024-05-22', vendedor_nombre: 'Juan Martínez', region: 'Oeste', estado: 'Completado', satisfaccion: 4.9, empleado_id: 4 },
  { cliente_nombre: 'DevOps Masters', producto: 'Servicio Premium', monto: 18500, cantidad: 6, fecha_venta: '2024-05-25', vendedor_nombre: 'Diego Ramírez', region: 'Centro', estado: 'Pendiente', satisfaccion: 4.2, empleado_id: 8 },
];

// Más datos de analytics (35 adicionales para llegar a 40+)
const additionalAnalytics = [
  { proyecto: 'Customer Loyalty Program', manager_nombre: 'Pedro Fernández', pais: 'Brasil', prioridad: 'Alta', estado: 'Activo', rendimiento: 78, completado: 65, satisfaccion: 4.6, tendencia: [55, 58, 62, 65, 68, 72, 78], manager_id: 6 },
  { proyecto: 'Supply Chain Optimization', manager_nombre: 'Sofia Torres', pais: 'Chile', prioridad: 'Media', estado: 'En Proceso', rendimiento: 62, completado: 48, satisfaccion: 4.2, tendencia: [30, 35, 40, 43, 46, 50, 62], manager_id: 7 },
  { proyecto: 'Digital Marketing Campaign', manager_nombre: 'Diego Ramírez', pais: 'Colombia', prioridad: 'Alta', estado: 'Activo', rendimiento: 85, completado: 72, satisfaccion: 4.7, tendencia: [60, 65, 70, 75, 78, 82, 85], manager_id: 8 },
  { proyecto: 'HR Management System', manager_nombre: 'Laura Sánchez', pais: 'Argentina', prioridad: 'Media', estado: 'En Proceso', rendimiento: 54, completado: 42, satisfaccion: 4.0, tendencia: [25, 30, 35, 38, 42, 48, 54], manager_id: 5 },
  { proyecto: 'Financial Reporting Tool', manager_nombre: 'Andrés Morales', pais: 'México', prioridad: 'Crítico', estado: 'Activo', rendimiento: 92, completado: 88, satisfaccion: 4.9, tendencia: [70, 75, 80, 84, 87, 90, 92], manager_id: 10 },
  { proyecto: 'Inventory Management Platform', manager_nombre: 'Carmen Ortiz', pais: 'España', prioridad: 'Alta', estado: 'Completado', rendimiento: 95, completado: 100, satisfaccion: 5.0, tendencia: [75, 80, 85, 88, 92, 96, 95], manager_id: 13 },
  { proyecto: 'Social Media Analytics', manager_nombre: 'Gabriela Romero', pais: 'Estados Unidos', prioridad: 'Media', estado: 'Activo', rendimiento: 68, completado: 55, satisfaccion: 4.3, tendencia: [40, 45, 50, 55, 60, 65, 68], manager_id: 19 },
  { proyecto: 'Employee Training Portal', manager_nombre: 'Natalia Medina', pais: 'Canadá', prioridad: 'Baja', estado: 'En Proceso', rendimiento: 45, completado: 32, satisfaccion: 3.8, tendencia: [20, 25, 28, 32, 35, 40, 45], manager_id: 25 },
  { proyecto: 'Cybersecurity Enhancement', manager_nombre: 'Ana García', pais: 'Reino Unido', prioridad: 'Crítico', estado: 'Activo', rendimiento: 88, completado: 78, satisfaccion: 4.8, tendencia: [65, 70, 74, 78, 82, 85, 88], manager_id: 1 },
  { proyecto: 'Product Recommendation Engine', manager_nombre: 'Carlos Rodríguez', pais: 'India', prioridad: 'Alta', estado: 'En Proceso', rendimiento: 72, completado: 58, satisfaccion: 4.4, tendencia: [45, 50, 55, 58, 62, 68, 72], manager_id: 2 },
  { proyecto: 'Quality Control System', manager_nombre: 'María López', pais: 'Francia', prioridad: 'Media', estado: 'Activo', rendimiento: 65, completado: 52, satisfaccion: 4.2, tendencia: [38, 42, 47, 52, 56, 60, 65], manager_id: 3 },
  { proyecto: 'Automated Testing Framework', manager_nombre: 'Juan Martínez', pais: 'Alemania', prioridad: 'Alta', estado: 'Completado', rendimiento: 93, completado: 100, satisfaccion: 4.9, tendencia: [70, 75, 80, 85, 89, 92, 93], manager_id: 4 },
  { proyecto: 'Real-time Notification System', manager_nombre: 'Pedro Fernández', pais: 'Japón', prioridad: 'Crítico', estado: 'Activo', rendimiento: 86, completado: 74, satisfaccion: 4.7, tendencia: [60, 65, 70, 74, 78, 82, 86], manager_id: 6 },
  { proyecto: 'Business Intelligence Dashboard', manager_nombre: 'Sofia Torres', pais: 'China', prioridad: 'Alta', estado: 'En Proceso', rendimiento: 70, completado: 60, satisfaccion: 4.5, tendencia: [45, 50, 55, 60, 64, 67, 70], manager_id: 7 },
  { proyecto: 'Payment Gateway Integration', manager_nombre: 'Diego Ramírez', pais: 'Australia', prioridad: 'Crítico', estado: 'Completado', rendimiento: 96, completado: 100, satisfaccion: 5.0, tendencia: [78, 82, 86, 90, 93, 95, 96], manager_id: 8 },
  { proyecto: 'Content Management System', manager_nombre: 'Laura Sánchez', pais: 'Argentina', prioridad: 'Media', estado: 'Activo', rendimiento: 58, completado: 45, satisfaccion: 4.1, tendencia: [30, 35, 40, 45, 48, 52, 58], manager_id: 5 },
  { proyecto: 'Customer Feedback Portal', manager_nombre: 'Andrés Morales', pais: 'Brasil', prioridad: 'Baja', estado: 'En Proceso', rendimiento: 42, completado: 28, satisfaccion: 3.6, tendencia: [15, 20, 25, 28, 32, 38, 42], manager_id: 10 },
  { proyecto: 'Warehouse Management System', manager_nombre: 'Carmen Ortiz', pais: 'Chile', prioridad: 'Alta', estado: 'Activo', rendimiento: 80, completado: 68, satisfaccion: 4.6, tendencia: [52, 58, 62, 68, 72, 76, 80], manager_id: 13 },
  { proyecto: 'Sales Forecasting Tool', manager_nombre: 'Gabriela Romero', pais: 'Colombia', prioridad: 'Crítico', estado: 'Activo', rendimiento: 90, completado: 82, satisfaccion: 4.8, tendencia: [68, 72, 76, 80, 84, 87, 90], manager_id: 19 },
  { proyecto: 'Email Marketing Automation', manager_nombre: 'Natalia Medina', pais: 'México', prioridad: 'Media', estado: 'Completado', rendimiento: 88, completado: 100, satisfaccion: 4.7, tendencia: [65, 70, 75, 80, 84, 86, 88], manager_id: 25 },
  { proyecto: 'Fleet Management Platform', manager_nombre: 'Ana García', pais: 'España', prioridad: 'Alta', estado: 'En Proceso', rendimiento: 74, completado: 62, satisfaccion: 4.4, tendencia: [48, 52, 58, 62, 66, 70, 74], manager_id: 1 },
  { proyecto: 'Compliance Tracking System', manager_nombre: 'Carlos Rodríguez', pais: 'Estados Unidos', prioridad: 'Crítico', estado: 'Activo', rendimiento: 84, completado: 72, satisfaccion: 4.6, tendencia: [58, 62, 68, 72, 76, 80, 84], manager_id: 2 },
  { proyecto: 'Resource Planning Tool', manager_nombre: 'María López', pais: 'Canadá', prioridad: 'Media', estado: 'En Proceso', rendimiento: 56, completado: 44, satisfaccion: 4.0, tendencia: [28, 32, 38, 44, 48, 52, 56], manager_id: 3 },
  { proyecto: 'API Gateway Development', manager_nombre: 'Juan Martínez', pais: 'Reino Unido', prioridad: 'Alta', estado: 'Completado', rendimiento: 94, completado: 100, satisfaccion: 4.9, tendencia: [72, 78, 82, 86, 90, 92, 94], manager_id: 4 },
  { proyecto: 'Chatbot Customer Service', manager_nombre: 'Pedro Fernández', pais: 'India', prioridad: 'Alta', estado: 'Activo', rendimiento: 76, completado: 64, satisfaccion: 4.5, tendencia: [50, 54, 60, 64, 68, 72, 76], manager_id: 6 },
  { proyecto: 'Video Streaming Platform', manager_nombre: 'Sofia Torres', pais: 'Francia', prioridad: 'Media', estado: 'En Proceso', rendimiento: 64, completado: 50, satisfaccion: 4.2, tendencia: [35, 40, 45, 50, 54, 60, 64], manager_id: 7 },
  { proyecto: 'Document Signing System', manager_nombre: 'Diego Ramírez', pais: 'Alemania', prioridad: 'Crítico', estado: 'Completado', rendimiento: 98, completado: 100, satisfaccion: 5.0, tendencia: [80, 84, 88, 92, 95, 97, 98], manager_id: 8 },
  { proyecto: 'Appointment Scheduling App', manager_nombre: 'Laura Sánchez', pais: 'Japón', prioridad: 'Baja', estado: 'Activo', rendimiento: 48, completado: 35, satisfaccion: 3.9, tendencia: [20, 25, 30, 35, 38, 42, 48], manager_id: 5 },
  { proyecto: 'Expense Tracking Portal', manager_nombre: 'Andrés Morales', pais: 'China', prioridad: 'Media', estado: 'En Proceso', rendimiento: 60, completado: 48, satisfaccion: 4.1, tendencia: [32, 38, 42, 48, 52, 56, 60], manager_id: 10 },
  { proyecto: 'Network Monitoring Tool', manager_nombre: 'Carmen Ortiz', pais: 'Australia', prioridad: 'Alta', estado: 'Activo', rendimiento: 82, completado: 70, satisfaccion: 4.7, tendencia: [56, 60, 66, 70, 74, 78, 82], manager_id: 13 },
  { proyecto: 'Loyalty Rewards Program', manager_nombre: 'Gabriela Romero', pais: 'Argentina', prioridad: 'Media', estado: 'Completado', rendimiento: 86, completado: 100, satisfaccion: 4.6, tendencia: [62, 68, 72, 78, 82, 84, 86], manager_id: 19 },
  { proyecto: 'Voice Recognition System', manager_nombre: 'Natalia Medina', pais: 'Brasil', prioridad: 'Crítico', estado: 'Activo', rendimiento: 89, completado: 76, satisfaccion: 4.8, tendencia: [64, 68, 72, 76, 80, 84, 89], manager_id: 25 },
  { proyecto: 'Geolocation Services', manager_nombre: 'Ana García', pais: 'Chile', prioridad: 'Alta', estado: 'En Proceso', rendimiento: 71, completado: 58, satisfaccion: 4.4, tendencia: [44, 48, 52, 58, 62, 66, 71], manager_id: 1 },
  { proyecto: 'Sentiment Analysis Engine', manager_nombre: 'Carlos Rodríguez', pais: 'Colombia', prioridad: 'Media', estado: 'Activo', rendimiento: 66, completado: 54, satisfaccion: 4.3, tendencia: [38, 42, 48, 54, 58, 62, 66], manager_id: 2 },
  { proyecto: 'Backup & Recovery System', manager_nombre: 'María López', pais: 'México', prioridad: 'Crítico', estado: 'Completado', rendimiento: 97, completado: 100, satisfaccion: 5.0, tendencia: [78, 82, 86, 90, 94, 96, 97], manager_id: 3 },
];

async function addMoreData() {
  console.log('🚀 Agregando más datos a la base de datos...');

  try {
    // Insertar ventas adicionales
    console.log('💰 Insertando ventas adicionales...');
    for (const venta of additionalSales) {
      await pool.execute(
        `INSERT INTO ventas (cliente_nombre, producto, monto, cantidad, fecha_venta, vendedor_nombre, region, estado, satisfaccion, empleado_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [venta.cliente_nombre, venta.producto, venta.monto, venta.cantidad, venta.fecha_venta, venta.vendedor_nombre, venta.region, venta.estado, venta.satisfaccion, venta.empleado_id]
      );
    }
    console.log(`✅ ${additionalSales.length} ventas adicionales insertadas`);

    // Insertar analytics adicionales
    console.log('📊 Insertando proyectos analytics adicionales...');
    for (const analytic of additionalAnalytics) {
      await pool.execute(
        `INSERT INTO analytics (proyecto, manager_nombre, pais, prioridad, estado, rendimiento, completado, satisfaccion, tendencia, manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [analytic.proyecto, analytic.manager_nombre, analytic.pais, analytic.prioridad, analytic.estado, analytic.rendimiento, analytic.completado, analytic.satisfaccion, JSON.stringify(analytic.tendencia), analytic.manager_id]
      );
    }
    console.log(`✅ ${additionalAnalytics.length} proyectos analytics adicionales insertados`);

    // Mostrar totales
    const [empleados] = await pool.execute('SELECT COUNT(*) as total FROM empleados');
    const [productos] = await pool.execute('SELECT COUNT(*) as total FROM productos');
    const [ventas] = await pool.execute('SELECT COUNT(*) as total FROM ventas');
    const [analytics] = await pool.execute('SELECT COUNT(*) as total FROM analytics');

    console.log('\n📈 TOTALES ACTUALES:');
    console.log(`   Empleados: ${(empleados as any)[0].total}`);
    console.log(`   Productos: ${(productos as any)[0].total}`);
    console.log(`   Ventas: ${(ventas as any)[0].total}`);
    console.log(`   Analytics: ${(analytics as any)[0].total}`);

    console.log('\n✨ Datos adicionales agregados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar datos:', error);
    process.exit(1);
  }
}

addMoreData();
