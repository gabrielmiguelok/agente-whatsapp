// scripts/migrate-data.ts
// Script para migrar datos iniciales a MariaDB

import pool from '../lib/db';

// Datos de empleados
const employeesDataInitial = [
  { id: 1, nombre: 'Ana García', pais: 'España', departamento: 'Ingeniería', salario: 75000, edad: 28, rendimiento: 25, fecha_ingreso: '2020-03-15', email: 'ana.garcia@empresa.com', nivel: 'Senior', satisfaccion: 4.2 },
  { id: 2, nombre: 'Carlos Rodríguez', pais: 'México', departamento: 'Marketing', salario: 52000, edad: 32, rendimiento: 28, fecha_ingreso: '2019-07-22', email: 'carlos.rodriguez@empresa.com', nivel: 'Mid', satisfaccion: 3.5 },
  { id: 3, nombre: 'María López', pais: 'Colombia', departamento: 'Ventas', salario: 68000, edad: 35, rendimiento: 31, fecha_ingreso: '2018-01-10', email: 'maria.lopez@empresa.com', nivel: 'Senior', satisfaccion: 4.7 },
  { id: 4, nombre: 'Juan Martínez', pais: 'Argentina', departamento: 'Ingeniería', salario: 82000, edad: 29, rendimiento: 34, fecha_ingreso: '2021-05-30', email: 'juan.martinez@empresa.com', nivel: 'Senior', satisfaccion: 4.9 },
  { id: 5, nombre: 'Laura Sánchez', pais: 'Chile', departamento: 'RRHH', salario: 58000, edad: 27, rendimiento: 37, fecha_ingreso: '2020-11-12', email: 'laura.sanchez@empresa.com', nivel: 'Mid', satisfaccion: 4.0 },
  { id: 6, nombre: 'Pedro Fernández', pais: 'España', departamento: 'Finanzas', salario: 91000, edad: 41, rendimiento: 40, fecha_ingreso: '2015-02-28', email: 'pedro.fernandez@empresa.com', nivel: 'Lead', satisfaccion: 4.8 },
  { id: 7, nombre: 'Sofia Torres', pais: 'Brasil', departamento: 'Diseño', salario: 61000, edad: 26, rendimiento: 43, fecha_ingreso: '2021-09-01', email: 'sofia.torres@empresa.com', nivel: 'Mid', satisfaccion: 4.1 },
  { id: 8, nombre: 'Diego Ramírez', pais: 'México', departamento: 'Ingeniería', salario: 79000, edad: 30, rendimiento: 46, fecha_ingreso: '2019-04-18', email: 'diego.ramirez@empresa.com', nivel: 'Senior', satisfaccion: 4.5 },
  { id: 9, nombre: 'Valentina Castro', pais: 'Estados Unidos', departamento: 'Marketing', salario: 48000, edad: 24, rendimiento: 49, fecha_ingreso: '2022-01-15', email: 'valentina.castro@empresa.com', nivel: 'Junior', satisfaccion: 3.2 },
  { id: 10, nombre: 'Andrés Morales', pais: 'Argentina', departamento: 'Ventas', salario: 72000, edad: 33, rendimiento: 52, fecha_ingreso: '2017-06-20', email: 'andres.morales@empresa.com', nivel: 'Senior', satisfaccion: 4.6 },
  { id: 11, nombre: 'Lucía Mendoza', pais: 'Chile', departamento: 'Ingeniería', salario: 78000, edad: 31, rendimiento: 55, fecha_ingreso: '2018-08-14', email: 'lucia.mendoza@empresa.com', nivel: 'Senior', satisfaccion: 4.3 },
  { id: 12, nombre: 'Roberto Silva', pais: 'Colombia', departamento: 'Marketing', salario: 55000, edad: 29, rendimiento: 58, fecha_ingreso: '2020-02-19', email: 'roberto.silva@empresa.com', nivel: 'Mid', satisfaccion: 3.8 },
  { id: 13, nombre: 'Carmen Ortiz', pais: 'España', departamento: 'Ventas', salario: 64000, edad: 34, rendimiento: 61, fecha_ingreso: '2019-11-05', email: 'carmen.ortiz@empresa.com', nivel: 'Senior', satisfaccion: 4.4 },
  { id: 14, nombre: 'Miguel Ángel Ruiz', pais: 'Brasil', departamento: 'RRHH', salario: 62000, edad: 38, rendimiento: 64, fecha_ingreso: '2016-04-22', email: 'miguel.ruiz@empresa.com', nivel: 'Lead', satisfaccion: 4.7 },
  { id: 15, nombre: 'Patricia Herrera', pais: 'Argentina', departamento: 'Finanzas', salario: 87000, edad: 36, rendimiento: 67, fecha_ingreso: '2017-09-11', email: 'patricia.herrera@empresa.com', nivel: 'Senior', satisfaccion: 4.6 },
  { id: 16, nombre: 'Fernando Vargas', pais: 'México', departamento: 'Diseño', salario: 59000, edad: 28, rendimiento: 70, fecha_ingreso: '2020-06-03', email: 'fernando.vargas@empresa.com', nivel: 'Mid', satisfaccion: 3.9 },
  { id: 17, nombre: 'Isabel Jiménez', pais: 'Chile', departamento: 'Ingeniería', salario: 73000, edad: 27, rendimiento: 73, fecha_ingreso: '2021-01-18', email: 'isabel.jimenez@empresa.com', nivel: 'Mid', satisfaccion: 4.2 },
  { id: 18, nombre: 'Ricardo Navarro', pais: 'Estados Unidos', departamento: 'Marketing', salario: 51000, edad: 25, rendimiento: 76, fecha_ingreso: '2022-03-07', email: 'ricardo.navarro@empresa.com', nivel: 'Junior', satisfaccion: 3.4 },
  { id: 19, nombre: 'Gabriela Romero', pais: 'Colombia', departamento: 'Ventas', salario: 70000, edad: 32, rendimiento: 79, fecha_ingreso: '2018-12-20', email: 'gabriela.romero@empresa.com', nivel: 'Senior', satisfaccion: 4.8 },
  { id: 20, nombre: 'Javier Cruz', pais: 'España', departamento: 'RRHH', salario: 56000, edad: 30, rendimiento: 82, fecha_ingreso: '2019-05-15', email: 'javier.cruz@empresa.com', nivel: 'Mid', satisfaccion: 4.0 },
  { id: 21, nombre: 'Claudia Reyes', pais: 'Brasil', departamento: 'Finanzas', salario: 89000, edad: 39, rendimiento: 85, fecha_ingreso: '2016-10-08', email: 'claudia.reyes@empresa.com', nivel: 'Lead', satisfaccion: 4.9 },
  { id: 22, nombre: 'Alejandro Flores', pais: 'Argentina', departamento: 'Diseño', salario: 63000, edad: 29, rendimiento: 88, fecha_ingreso: '2020-08-25', email: 'alejandro.flores@empresa.com', nivel: 'Mid', satisfaccion: 4.1 },
  { id: 23, nombre: 'Beatriz Gil', pais: 'México', departamento: 'Ingeniería', salario: 81000, edad: 33, rendimiento: 91, fecha_ingreso: '2017-03-12', email: 'beatriz.gil@empresa.com', nivel: 'Senior', satisfaccion: 4.7 },
  { id: 24, nombre: 'Daniel Ramos', pais: 'Chile', departamento: 'Marketing', salario: 49000, edad: 26, rendimiento: 94, fecha_ingreso: '2021-11-29', email: 'daniel.ramos@empresa.com', nivel: 'Junior', satisfaccion: 3.3 },
  { id: 25, nombre: 'Natalia Medina', pais: 'Colombia', departamento: 'Ventas', salario: 67000, edad: 31, rendimiento: 97, fecha_ingreso: '2019-02-14', email: 'natalia.medina@empresa.com', nivel: 'Senior', satisfaccion: 4.5 },
  { id: 26, nombre: 'Sergio Castro', pais: 'España', departamento: 'RRHH', salario: 60000, edad: 35, rendimiento: 100, fecha_ingreso: '2018-07-19', email: 'sergio.castro@empresa.com', nivel: 'Mid', satisfaccion: 4.2 },
  { id: 27, nombre: 'Mónica Pérez', pais: 'Brasil', departamento: 'Finanzas', salario: 85000, edad: 37, rendimiento: 35, fecha_ingreso: '2017-12-04', email: 'monica.perez@empresa.com', nivel: 'Senior', satisfaccion: 4.6 },
  { id: 28, nombre: 'Raúl Delgado', pais: 'Argentina', departamento: 'Diseño', salario: 58000, edad: 27, rendimiento: 62, fecha_ingreso: '2021-04-16', email: 'raul.delgado@empresa.com', nivel: 'Mid', satisfaccion: 3.7 },
  { id: 29, nombre: 'Elena Moreno', pais: 'México', departamento: 'Ingeniería', salario: 76000, edad: 30, rendimiento: 80, fecha_ingreso: '2019-09-23', email: 'elena.moreno@empresa.com', nivel: 'Senior', satisfaccion: 4.8 },
  { id: 30, nombre: 'Jorge Gutiérrez', pais: 'Chile', departamento: 'Marketing', salario: 53000, edad: 28, rendimiento: 45, fecha_ingreso: '2020-12-10', email: 'jorge.gutierrez@empresa.com', nivel: 'Mid', satisfaccion: 3.6 },
];

// Datos de productos
const productsDataInitial = [
  { id: 1, producto: 'Laptop Dell XPS 15', categoria: 'Electrónica', precio: 1899, stock: 45, rating: 4.8, fecha_lanzamiento: '2023-03-10', url: 'https://www.dell.com/xps' },
  { id: 2, producto: 'iPhone 15 Pro', categoria: 'Smartphones', precio: 1199, stock: 120, rating: 4.9, fecha_lanzamiento: '2023-09-15', url: 'https://www.apple.com/iphone' },
  { id: 3, producto: 'Samsung Galaxy S24', categoria: 'Smartphones', precio: 999, stock: 85, rating: 4.7, fecha_lanzamiento: '2024-01-20', url: 'https://www.samsung.com' },
  { id: 4, producto: 'MacBook Pro 16"', categoria: 'Electrónica', precio: 2499, stock: 32, rating: 4.9, fecha_lanzamiento: '2023-11-05', url: 'https://www.apple.com/macbook' },
  { id: 5, producto: 'Sony WH-1000XM5', categoria: 'Audio', precio: 399, stock: 200, rating: 4.8, fecha_lanzamiento: '2023-05-12', url: 'https://www.sony.com' },
  { id: 6, producto: 'iPad Air', categoria: 'Tablets', precio: 599, stock: 95, rating: 4.6, fecha_lanzamiento: '2023-04-18', url: 'https://www.apple.com/ipad' },
  { id: 7, producto: 'LG OLED TV 65"', categoria: 'Televisores', precio: 2199, stock: 18, rating: 4.9, fecha_lanzamiento: '2023-02-28', url: 'https://www.lg.com' },
  { id: 8, producto: 'Nintendo Switch OLED', categoria: 'Gaming', precio: 349, stock: 150, rating: 4.7, fecha_lanzamiento: '2021-10-08', url: 'https://www.nintendo.com' },
  { id: 9, producto: 'Kindle Paperwhite', categoria: 'E-readers', precio: 139, stock: 250, rating: 4.6, fecha_lanzamiento: '2023-06-22', url: 'https://www.amazon.com/kindle' },
  { id: 10, producto: 'AirPods Pro 2', categoria: 'Audio', precio: 249, stock: 180, rating: 4.8, fecha_lanzamiento: '2023-09-23', url: 'https://www.apple.com/airpods' },
  { id: 11, producto: 'HP Spectre x360', categoria: 'Electrónica', precio: 1599, stock: 52, rating: 4.7, fecha_lanzamiento: '2023-07-14', url: 'https://www.hp.com' },
  { id: 12, producto: 'Google Pixel 8 Pro', categoria: 'Smartphones', precio: 899, stock: 110, rating: 4.6, fecha_lanzamiento: '2023-10-04', url: 'https://www.google.com/pixel' },
  { id: 13, producto: 'Bose QuietComfort Ultra', categoria: 'Audio', precio: 429, stock: 175, rating: 4.8, fecha_lanzamiento: '2023-09-21', url: 'https://www.bose.com' },
  { id: 14, producto: 'Samsung Galaxy Tab S9', categoria: 'Tablets', precio: 799, stock: 68, rating: 4.7, fecha_lanzamiento: '2023-08-11', url: 'https://www.samsung.com/tablets' },
  { id: 15, producto: 'Sony PlayStation 5', categoria: 'Gaming', precio: 499, stock: 95, rating: 4.9, fecha_lanzamiento: '2020-11-12', url: 'https://www.playstation.com' },
  { id: 16, producto: 'Microsoft Surface Pro 9', categoria: 'Tablets', precio: 999, stock: 42, rating: 4.5, fecha_lanzamiento: '2022-10-25', url: 'https://www.microsoft.com/surface' },
  { id: 17, producto: 'Canon EOS R6', categoria: 'Electrónica', precio: 2499, stock: 28, rating: 4.9, fecha_lanzamiento: '2020-08-06', url: 'https://www.canon.com' },
  { id: 18, producto: 'OnePlus 11', categoria: 'Smartphones', precio: 699, stock: 130, rating: 4.6, fecha_lanzamiento: '2023-02-07', url: 'https://www.oneplus.com' },
  { id: 19, producto: 'Samsung QLED TV 55"', categoria: 'Televisores', precio: 1299, stock: 35, rating: 4.7, fecha_lanzamiento: '2023-03-25', url: 'https://www.samsung.com/tv' },
  { id: 20, producto: 'Xbox Series X', categoria: 'Gaming', precio: 499, stock: 88, rating: 4.8, fecha_lanzamiento: '2020-11-10', url: 'https://www.xbox.com' },
  { id: 21, producto: 'Lenovo ThinkPad X1', categoria: 'Electrónica', precio: 1899, stock: 40, rating: 4.7, fecha_lanzamiento: '2023-01-15', url: 'https://www.lenovo.com' },
  { id: 22, producto: 'JBL Flip 6', categoria: 'Audio', precio: 129, stock: 220, rating: 4.7, fecha_lanzamiento: '2021-11-01', url: 'https://www.jbl.com' },
  { id: 23, producto: 'Motorola Edge 40', categoria: 'Smartphones', precio: 599, stock: 145, rating: 4.5, fecha_lanzamiento: '2023-05-04', url: 'https://www.motorola.com' },
  { id: 24, producto: 'Asus ROG Ally', categoria: 'Gaming', precio: 699, stock: 72, rating: 4.6, fecha_lanzamiento: '2023-06-13', url: 'https://www.asus.com' },
  { id: 25, producto: 'GoPro Hero 12', categoria: 'Electrónica', precio: 399, stock: 115, rating: 4.8, fecha_lanzamiento: '2023-09-13', url: 'https://www.gopro.com' },
  { id: 26, producto: 'Amazon Echo Dot 5', categoria: 'Audio', precio: 49, stock: 300, rating: 4.5, fecha_lanzamiento: '2022-10-20', url: 'https://www.amazon.com/echo' },
  { id: 27, producto: 'Xiaomi 13 Pro', categoria: 'Smartphones', precio: 999, stock: 98, rating: 4.7, fecha_lanzamiento: '2023-02-26', url: 'https://www.mi.com' },
  { id: 28, producto: 'Kobo Libra 2', categoria: 'E-readers', precio: 179, stock: 185, rating: 4.6, fecha_lanzamiento: '2021-10-19', url: 'https://www.kobo.com' },
  { id: 29, producto: 'TCL 4K TV 43"', categoria: 'Televisores', precio: 349, stock: 65, rating: 4.4, fecha_lanzamiento: '2023-04-10', url: 'https://www.tcl.com' },
  { id: 30, producto: 'Razer BlackShark V2', categoria: 'Gaming', precio: 99, stock: 160, rating: 4.6, fecha_lanzamiento: '2020-08-30', url: 'https://www.razer.com' },
];

// Solo incluyo los primeros registros de ventas y analytics para no hacer el script muy largo
const salesDataInitial = [
  { id: 1, cliente_nombre: 'Acme Corp', producto: 'Servicio Premium', monto: 15000, cantidad: 3, fecha_venta: '2024-01-15', vendedor_nombre: 'Ana García', region: 'Norte', estado: 'Completado', satisfaccion: 4.8, cliente_id: null, empleado_id: 1 },
  { id: 2, cliente_nombre: 'TechStart Inc', producto: 'Plan Básico', monto: 5000, cantidad: 10, fecha_venta: '2024-01-18', vendedor_nombre: 'Carlos Rodríguez', region: 'Sur', estado: 'Pendiente', satisfaccion: 3.5, cliente_id: null, empleado_id: 2 },
  { id: 3, cliente_nombre: 'Global Solutions', producto: 'Servicio Enterprise', monto: 25000, cantidad: 1, fecha_venta: '2024-01-20', vendedor_nombre: 'María López', region: 'Este', estado: 'Completado', satisfaccion: 5.0, cliente_id: null, empleado_id: 3 },
  { id: 4, cliente_nombre: 'StartupX', producto: 'Plan Básico', monto: 3500, cantidad: 7, fecha_venta: '2024-01-22', vendedor_nombre: 'Juan Martínez', region: 'Oeste', estado: 'Completado', satisfaccion: 4.2, cliente_id: null, empleado_id: 4 },
  { id: 5, cliente_nombre: 'MegaCorp', producto: 'Servicio Premium', monto: 18000, cantidad: 4, fecha_venta: '2024-01-25', vendedor_nombre: 'Laura Sánchez', region: 'Centro', estado: 'En Proceso', satisfaccion: 4.5, cliente_id: null, empleado_id: 5 },
];

const analyticsDataInitial = [
  { id: 1, proyecto: 'E-commerce Platform', manager_nombre: 'Ana García', pais: 'Argentina', prioridad: 'Alta', estado: 'Activo', rendimiento: 25, completado: 15, satisfaccion: 4.5, tendencia: [65, 68, 72, 75, 78, 82, 87], manager_id: 1 },
  { id: 2, proyecto: 'Mobile App Redesign', manager_nombre: 'Carlos Rodríguez', pais: 'México', prioridad: 'Media', estado: 'En Proceso', rendimiento: 28, completado: 18, satisfaccion: 3.8, tendencia: [40, 42, 45, 48, 52, 58, 64], manager_id: 2 },
  { id: 3, proyecto: 'Cloud Migration', manager_nombre: 'María López', pais: 'España', prioridad: 'Crítico', estado: 'Activo', rendimiento: 31, completado: 22, satisfaccion: 4.8, tendencia: [75, 78, 82, 85, 88, 90, 93], manager_id: 3 },
  { id: 4, proyecto: 'Data Analytics Dashboard', manager_nombre: 'Juan Martínez', pais: 'Chile', prioridad: 'Alta', estado: 'Completado', rendimiento: 34, completado: 26, satisfaccion: 4.9, tendencia: [85, 88, 90, 92, 95, 97, 98], manager_id: 4 },
  { id: 5, proyecto: 'AI Chatbot Integration', manager_nombre: 'Laura Sánchez', pais: 'Colombia', prioridad: 'Media', estado: 'En Proceso', rendimiento: 37, completado: 30, satisfaccion: 3.5, tendencia: [25, 30, 35, 40, 45, 50, 56], manager_id: 5 },
];

async function migrate() {
  console.log('🚀 Iniciando migración de datos...');

  try {
    // Limpiar tablas existentes
    console.log('🧹 Limpiando tablas...');
    await pool.execute('DELETE FROM analytics');
    await pool.execute('DELETE FROM ventas');
    await pool.execute('DELETE FROM productos');
    await pool.execute('DELETE FROM empleados');
    await pool.execute('DELETE FROM clientes');

    // Insertar empleados
    console.log('👥 Insertando empleados...');
    for (const emp of employeesDataInitial) {
      await pool.execute(
        `INSERT INTO empleados (id, nombre, pais, departamento, salario, edad, rendimiento, fecha_ingreso, email, nivel, satisfaccion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.id, emp.nombre, emp.pais, emp.departamento, emp.salario, emp.edad, emp.rendimiento, emp.fecha_ingreso, emp.email, emp.nivel, emp.satisfaccion]
      );
    }
    console.log(`✅ ${employeesDataInitial.length} empleados insertados`);

    // Insertar productos
    console.log('📦 Insertando productos...');
    for (const prod of productsDataInitial) {
      await pool.execute(
        `INSERT INTO productos (id, producto, categoria, precio, stock, rating, fecha_lanzamiento, url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.id, prod.producto, prod.categoria, prod.precio, prod.stock, prod.rating, prod.fecha_lanzamiento, prod.url]
      );
    }
    console.log(`✅ ${productsDataInitial.length} productos insertados`);

    // Insertar ventas
    console.log('💰 Insertando ventas...');
    for (const venta of salesDataInitial) {
      await pool.execute(
        `INSERT INTO ventas (id, cliente_nombre, producto, monto, cantidad, fecha_venta, vendedor_nombre, region, estado, satisfaccion, cliente_id, empleado_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [venta.id, venta.cliente_nombre, venta.producto, venta.monto, venta.cantidad, venta.fecha_venta, venta.vendedor_nombre, venta.region, venta.estado, venta.satisfaccion, venta.cliente_id, venta.empleado_id]
      );
    }
    console.log(`✅ ${salesDataInitial.length} ventas insertadas`);

    // Insertar analytics
    console.log('📊 Insertando proyectos analytics...');
    for (const analytic of analyticsDataInitial) {
      await pool.execute(
        `INSERT INTO analytics (id, proyecto, manager_nombre, pais, prioridad, estado, rendimiento, completado, satisfaccion, tendencia, manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [analytic.id, analytic.proyecto, analytic.manager_nombre, analytic.pais, analytic.prioridad, analytic.estado, analytic.rendimiento, analytic.completado, analytic.satisfaccion, JSON.stringify(analytic.tendencia), analytic.manager_id]
      );
    }
    console.log(`✅ ${analyticsDataInitial.length} proyectos analytics insertados`);

    console.log('✨ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrate();
