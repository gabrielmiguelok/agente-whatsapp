'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';
import CustomTable from '@/CustomTable';
import { ErrorModal } from '@/CustomTable/ErrorModal';
import { Tabs, Tab, Box, Typography, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

// ==================== DEFINICIONES DE COLUMNAS CON TIPOS AVANZADOS ====================

const revendedoresColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  nombre: { type: 'avatar', header: 'NOMBRE', width: 200 },
  telefono: { type: 'text', header: 'TELÉFONO', width: 140 },
  email: { type: 'text', header: 'EMAIL', width: 220 },
  fecha_alta: { type: 'date', header: 'FECHA ALTA', width: 140 },
});

const clientesColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  nombre: { type: 'avatar', header: 'NOMBRE', width: 200 },
  telefono: { type: 'text', header: 'TELÉFONO', width: 140 },
  email: { type: 'text', header: 'EMAIL', width: 220 },
  responsable_nombre: {
    type: 'foreignKey',
    header: 'RESPONSABLE',
    width: 180,
    dataset: 'revendedores',
    foreignKeyField: 'responsable_id',
    displayField: 'responsable_nombre',
  },
  fecha: { type: 'date', header: 'FECHA', width: 140 },
});

const sucursalesColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  cliente_nombre: {
    type: 'foreignKey',
    header: 'CLIENTE',
    width: 200,
    dataset: 'clientes',
    foreignKeyField: 'cliente_id',
    displayField: 'cliente_nombre',
  },
  provincia: {
    type: 'badge',
    header: 'PROVINCIA',
    width: 150,
    options: [
      { value: 'Buenos Aires', label: 'Buenos Aires' },
      { value: 'Catamarca', label: 'Catamarca' },
      { value: 'Chaco', label: 'Chaco' },
      { value: 'Chubut', label: 'Chubut' },
      { value: 'Córdoba', label: 'Córdoba' },
      { value: 'Corrientes', label: 'Corrientes' },
      { value: 'Entre Ríos', label: 'Entre Ríos' },
      { value: 'Formosa', label: 'Formosa' },
      { value: 'Jujuy', label: 'Jujuy' },
      { value: 'La Rioja', label: 'La Rioja' },
      { value: 'Mendoza', label: 'Mendoza' },
      { value: 'Misiones', label: 'Misiones' },
      { value: 'Neuquén', label: 'Neuquén' },
      { value: 'Río Negro', label: 'Río Negro' },
      { value: 'Salta', label: 'Salta' },
      { value: 'Santa Fe', label: 'Santa Fe' },
      { value: 'Santiago del Estero', label: 'Santiago del Estero' },
      { value: 'Tucumán', label: 'Tucumán' },
    ]
  },
  localidad: { type: 'text', header: 'LOCALIDAD', width: 150 },
  domicilio: { type: 'text', header: 'DOMICILIO', width: 250 },
  responsable_nombre: {
    type: 'foreignKey',
    header: 'RESPONSABLE',
    width: 150,
    dataset: 'revendedores',
    foreignKeyField: 'responsable_id',
    displayField: 'responsable_nombre',
  },
  despachante_nombre: {
    type: 'foreignKey',
    header: 'DESPACHANTE',
    width: 150,
    dataset: 'revendedores',
    foreignKeyField: 'despachante_id',
    displayField: 'despachante_nombre',
  },
});

const operacionesColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  fecha: { type: 'date', header: 'FECHA', width: 120 },
  producto: { type: 'text', header: 'PRODUCTO', width: 250 },
  proveedor: {
    type: 'badge',
    header: 'PROVEEDOR',
    width: 180,
    allowCreate: true,
    options: [
      { value: 'AudioPro', label: 'AudioPro' },
      { value: 'CompuPartes', label: 'CompuPartes' },
      { value: 'ElectroMax', label: 'ElectroMax' },
      { value: 'ImportDirect', label: 'ImportDirect' },
      { value: 'Mercado Mayorista', label: 'Mercado Mayorista' },
      { value: 'MueblesOficina', label: 'MueblesOficina' },
      { value: 'Papelera Central', label: 'Papelera Central' },
      { value: 'TechStore SA', label: 'TechStore SA' },
    ]
  },
  unidades: { type: 'numeric', header: 'UNIDADES', width: 100 },
  precio_unitario: {
    type: 'currency',
    header: 'PRECIO UNIT.',
    width: 140,
    textAlign: 'right',
    currencySymbol: '$',
    currencyLocale: 'es-AR'
  },
  con_iva: {
    type: 'badge',
    header: 'CON IVA',
    width: 90,
    options: [
      { value: '1', label: 'SÍ' },
      { value: '0', label: 'NO' },
    ]
  },
  costo_variable_porcentaje: {
    type: 'percentage',
    header: 'COSTO VAR %',
    width: 120,
    textAlign: 'right'
  },
  subtotal: {
    type: 'currency',
    header: 'SUBTOTAL',
    width: 140,
    textAlign: 'right',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
    editable: false  // Campo calculado
  },
  monto_iva: {
    type: 'currency',
    header: 'MONTO IVA',
    width: 140,
    textAlign: 'right',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
    editable: false  // Campo calculado
  },
  costo_variable: {
    type: 'currency',
    header: 'COSTO VAR.',
    width: 140,
    textAlign: 'right',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
    editable: false  // Campo calculado
  },
  total: {
    type: 'currency',
    header: 'TOTAL',
    width: 150,
    textAlign: 'right',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
    editable: false  // Campo calculado
  },
  observaciones: { type: 'text', header: 'OBSERVACIONES', width: 200 },
});

export default function SistemaControlPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hook para detectar tema oscuro
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Estados para los datos
  const [revendedores, setRevendedores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [operaciones, setOperaciones] = useState<any[]>([]);

  // Cache de opciones dinámicas para foreign keys
  const [optionsCache, setOptionsCache] = useState<Record<string, any[]>>({});

  // Estado para el modal de error
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para agregar nuevos registros
  const [addRecordState, setAddRecordState] = useState<'idle' | 'adding' | 'saving' | 'confirmed'>('idle');
  const [newRecordData, setNewRecordData] = useState<any>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setErrorMessage('');
  };

  useEffect(() => {
    setIsHydrated(true);
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? currentTheme === 'dark' : false;

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (isHydrated) {
      loadData();
      // Precargar opciones de foreign keys
      preloadForeignKeyOptions();
    }
  }, [activeTab, isHydrated]);

  const loadData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 0:
          endpoint = '/api/revendedores';
          break;
        case 1:
          endpoint = '/api/clientes';
          break;
        case 2:
          endpoint = '/api/sucursales';
          break;
        case 3:
          endpoint = '/api/operaciones';
          break;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Error al cargar datos');

      const data = await response.json();

      switch (activeTab) {
        case 0:
          setRevendedores(data);
          break;
        case 1:
          setClientes(data);
          break;
        case 2:
          setSucursales(data);
          break;
        case 3:
          setOperaciones(data);
          break;
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Precargar opciones de foreign keys
  const preloadForeignKeyOptions = async () => {
    const datasetsToLoad = new Set<string>();

    // Determinar qué datasets cargar según la pestaña activa
    switch (activeTab) {
      case 1: // Clientes
        datasetsToLoad.add('revendedores');
        break;
      case 2: // Sucursales
        datasetsToLoad.add('clientes');
        datasetsToLoad.add('revendedores');
        break;
    }

    // Cargar opciones en paralelo
    const promises = Array.from(datasetsToLoad).map(async (dataset) => {
      if (optionsCache[dataset]) return; // Ya está en cache

      try {
        const response = await fetch(`/api/select-options?dataset=${dataset}`);
        const data = await response.json();
        if (data.success && data.options) {
          setOptionsCache(prev => ({ ...prev, [dataset]: data.options }));
        }
      } catch (error) {
        console.error(`Error cargando opciones de ${dataset}:`, error);
      }
    });

    await Promise.all(promises);
  };

  // Mapeo de columnas de nombres a campos ID y datasets
  const foreignKeyConfig: Record<string, { idField: string; dataset: string }> = {
    'responsable_nombre': { idField: 'responsable_id', dataset: 'revendedores' },
    'despachante_nombre': { idField: 'despachante_id', dataset: 'revendedores' },
    'cliente_nombre': { idField: 'cliente_id', dataset: 'clientes' },
  };

  // Handler para edición de celdas con update optimista
  const handleCellEdit = async (rowId: string, colId: string, newValue: string) => {
    try {
      // Si es un registro nuevo (temporal), solo actualizar el estado local
      if (rowId.startsWith('temp_')) {
        console.log('📝 [HANDLECELLEDIT] Editando registro temporal:', { rowId, colId, newValue });

        // Configuración de foreign key si aplica
        const fkConfig = foreignKeyConfig[colId];
        let fieldToUpdate = colId;
        let valueToUpdate = newValue;

        // Si es un foreign key, necesitamos extraer el ID del valor seleccionado
        if (fkConfig) {
          fieldToUpdate = fkConfig.idField;
          const options = optionsCache[fkConfig.dataset];

          if (options && options.length > 0) {
            const selectedOption = options.find((opt: any) => opt.label === newValue);
            if (selectedOption) {
              valueToUpdate = selectedOption.value;
              console.log('✅ [HANDLECELLEDIT] FK en temporal - Opción encontrada:', { label: selectedOption.label, value: selectedOption.value });
            } else {
              console.error(`❌ [HANDLECELLEDIT] No se encontró el ID para "${newValue}" en registro temporal`);
              return;
            }
          }
        }

        // Actualizar newRecordData con el campo correcto
        setNewRecordData((prev: any) => {
          if (!prev) return prev;
          const updated = { ...prev, [colId]: newValue };
          // Si es foreign key, también actualizar el campo ID
          if (fkConfig) {
            updated[fieldToUpdate] = valueToUpdate;
          }
          console.log('📝 [HANDLECELLEDIT] newRecordData actualizado:', updated);
          return updated;
        });

        // Actualizar también la UI de la tabla
        const currentData = getCurrentData();
        const updatedData = currentData.map(item => {
          if (item.id === rowId) {
            const updated = { ...item, [colId]: newValue };
            // Si es foreign key, también actualizar el campo ID
            if (fkConfig) {
              updated[fieldToUpdate] = valueToUpdate;
            }
            return updated;
          }
          return item;
        });
        updateCurrentTableData(updatedData);

        return; // No enviar al backend todavía
      }

      const numericRowId = Number(rowId);

      console.log('🔧 [HANDLECELLEDIT] Inicio:', { rowId, colId, newValue, activeTab });

      // Determinar endpoint según la pestaña activa
      const endpoints = ['/api/revendedores', '/api/clientes', '/api/sucursales', '/api/operaciones'];
      const endpoint = endpoints[activeTab];

      const setters = [setRevendedores, setClientes, setSucursales, setOperaciones];
      const setter = setters[activeTab];

      // Configuración de foreign key si aplica
      const fkConfig = foreignKeyConfig[colId];
      let fieldToUpdate = colId;
      let valueToSend = newValue;

      console.log('🔍 [HANDLECELLEDIT] FK Config:', { colId, fkConfig, hasFkConfig: !!fkConfig });

      // Si es un foreign key, convertir nombre a ID
      if (fkConfig) {
        fieldToUpdate = fkConfig.idField;
        const options = optionsCache[fkConfig.dataset];

        console.log('📋 [HANDLECELLEDIT] Options cache:', {
          dataset: fkConfig.dataset,
          hasOptions: !!options,
          optionsCount: options?.length,
          options: options
        });

        if (options) {
          // Buscar por label (nombre) O por value (ID)
          const selectedOption = options.find((opt: any) =>
            opt.label === newValue || opt.value === newValue
          );

          console.log('🔎 [HANDLECELLEDIT] Búsqueda de opción:', {
            newValue,
            selectedOption,
            searchedBy: selectedOption ? (selectedOption.label === newValue ? 'label' : 'value') : 'none'
          });

          if (selectedOption) {
            valueToSend = selectedOption.value;
            console.log('✅ [HANDLECELLEDIT] Opción encontrada:', { label: selectedOption.label, value: selectedOption.value });
          } else {
            console.error(`❌ [HANDLECELLEDIT] No se encontró el ID para "${newValue}"`);
            console.error('Available options:', options.map((opt: any) => ({ label: opt.label, value: opt.value })));
            return;
          }
        } else {
          console.error(`❌ [HANDLECELLEDIT] No hay opciones cargadas para ${fkConfig.dataset}`);
          return;
        }
      }

      console.log('🔄 [HANDLECELLEDIT] UPDATE OPTIMISTA - Actualizando UI:', {
        numericRowId,
        colId,
        newValue,
        fieldToUpdate,
        valueToSend
      });

      // UPDATE OPTIMISTA: Actualizar UI inmediatamente
      setter((prev: any[]) =>
        prev.map(item =>
          item.id === numericRowId
            ? { ...item, [colId]: newValue, [fieldToUpdate]: valueToSend }
            : item
        )
      );

      console.log('📡 [HANDLECELLEDIT] Enviando al backend:', {
        endpoint,
        body: { id: rowId, field: fieldToUpdate, value: valueToSend }
      });

      // Enviar al backend en segundo plano
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rowId,
          field: fieldToUpdate,
          value: valueToSend,
        }),
      });

      console.log('📥 [HANDLECELLEDIT] Respuesta del servidor:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [HANDLECELLEDIT] Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al actualizar');
      }

      const result = await response.json();
      console.log('✅ [HANDLECELLEDIT] Datos del servidor:', result);

      // Actualizar con datos reales del servidor (incluye nombres resueltos por JOINs)
      setter((prev: any[]) =>
        prev.map(item =>
          item.id === numericRowId ? result.data : item
        )
      );

      console.log('✅ [HANDLECELLEDIT] Actualización confirmada desde el servidor');
    } catch (error: any) {
      console.error('❌ Error al actualizar:', error);
      showError(`Error: ${error.message}`);

      // ROLLBACK: Recargar datos desde el servidor
      loadData();
    }
  };

  // Función para manejar agregar nuevo registro
  const handleAddRecord = async () => {
    console.log('🔧 [HANDLEADDRECORD] Estado actual:', addRecordState);

    if (addRecordState === 'idle') {
      // Estado 1: Iniciar modo de agregar
      console.log('➕ [HANDLEADDRECORD] Iniciando modo agregar');
      setAddRecordState('adding');
      setIsAddingRecord(true);

      // Crear registro temporal vacío según la tabla actual
      const tempRecord = createEmptyRecord();
      setNewRecordData(tempRecord);

      // Agregar fila temporal a la tabla correspondiente
      const currentData = getCurrentData();
      const updatedData = [tempRecord, ...currentData];
      updateCurrentTableData(updatedData);

    } else if (addRecordState === 'adding') {
      // Estado 2: Guardar el registro
      console.log('💾 [HANDLEADDRECORD] Intentando guardar registro:', newRecordData);
      setAddRecordState('saving');

      try {
        // Determinar endpoint según tab activo
        let endpoint = '';
        switch (activeTab) {
          case 0: endpoint = '/api/revendedores'; break;
          case 1: endpoint = '/api/clientes'; break;
          case 2: endpoint = '/api/sucursales'; break;
          case 3: endpoint = '/api/operaciones'; break;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecordData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear registro');
        }

        const result = await response.json();
        console.log('✅ [HANDLEADDRECORD] Registro creado:', result.data);

        // Estado 3: Confirmar guardado
        setAddRecordState('confirmed');

        // Recargar datos para obtener el registro con ID del servidor
        await loadData();

        // Resetear después de 1 segundo
        setTimeout(() => {
          setAddRecordState('idle');
          setIsAddingRecord(false);
          setNewRecordData(null);
        }, 1000);

      } catch (error: any) {
        console.error('❌ [HANDLEADDRECORD] Error:', error);
        showError(`Error al crear registro: ${error.message}`);
        setAddRecordState('adding'); // Volver a estado adding para reintentar
      }
    }
  };

  // Crear registro vacío según la tabla activa
  const createEmptyRecord = () => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    switch (activeTab) {
      case 0: // Revendedores
        return {
          id: tempId,
          nombre: '',
          telefono: '',
          email: '',
          fecha_alta: now,
          _isNew: true,
        };
      case 1: // Clientes
        return {
          id: tempId,
          nombre: '',
          telefono: '',
          email: '',
          responsable_id: null,
          responsable_nombre: null,
          fecha: now,
          _isNew: true,
        };
      case 2: // Sucursales
        return {
          id: tempId,
          cliente_id: null,
          cliente_nombre: null,
          provincia: '',
          localidad: '',
          domicilio: '',
          responsable_id: null,
          responsable_nombre: null,
          despachante_id: null,
          despachante_nombre: null,
          _isNew: true,
        };
      case 3: // Operaciones
        return {
          id: tempId,
          fecha: now,
          producto: '',
          proveedor: '',
          unidades: 1,
          precio_unitario: 0,
          con_iva: '0',
          porcentaje_iva: 21,
          costo_variable_porcentaje: 0,
          observaciones: '',
          _isNew: true,
        };
      default:
        return { id: tempId, _isNew: true };
    }
  };

  // Actualizar datos de la tabla actual
  const updateCurrentTableData = (data: any[]) => {
    switch (activeTab) {
      case 0: setRevendedores(data); break;
      case 1: setClientes(data); break;
      case 2: setSucursales(data); break;
      case 3: setOperaciones(data); break;
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Resetear estado de agregar si cambiamos de tab
    if (isAddingRecord) {
      setAddRecordState('idle');
      setIsAddingRecord(false);
      setNewRecordData(null);
    }
    setActiveTab(newValue);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 0:
        return revendedores;
      case 1:
        return clientes;
      case 2:
        return sucursales;
      case 3:
        return operaciones;
      default:
        return [];
    }
  };

  const getCurrentColumns = () => {
    let columns: any[] = [];
    switch (activeTab) {
      case 0:
        columns = revendedoresColumns;
        break;
      case 1:
        columns = clientesColumns;
        break;
      case 2:
        columns = sucursalesColumns;
        break;
      case 3:
        columns = operacionesColumns;
        break;
      default:
        return [];
    }

    // Inyectar opciones dinámicas en columnas de tipo foreignKey
    return columns.map((col: any) => {
      if (col.type === 'foreignKey' && col.dataset && optionsCache[col.dataset]) {
        return {
          ...col,
          options: optionsCache[col.dataset],
        };
      }
      return col;
    });
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 0:
        return 'Gestión de revendedores (responsables y despachantes del sistema)';
      case 1:
        return 'Gestión de clientes con sus responsables asignados';
      case 2:
        return 'Gestión de sucursales por cliente con ubicaciones geográficas';
      case 3:
        return 'Registro de operaciones de compra con cálculos automáticos de IVA y costos';
      default:
        return '';
    }
  };

  const getTabStats = () => {
    const data = getCurrentData();
    switch (activeTab) {
      case 0:
        return `${data.length} revendedores`;
      case 1:
        return `${data.length} clientes`;
      case 2:
        return `${data.length} sucursales`;
      case 3:
        const total = data.reduce((acc: number, op: any) => acc + (Number(op.total) || 0), 0);
        return `${data.length} operaciones - Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return '';
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: isDarkMode ? '#0a0f1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1a1a1a',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          borderRadius: 0,
          borderBottom: '2px solid',
          borderColor: isDarkMode ? '#2d4a6f' : '#127CF3',
          bgcolor: isDarkMode ? '#1a2332' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : 'inherit',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            mb: { xs: 1, sm: 2 }
          }}
        >
          Sistema de Control
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? '#b0c4de' : 'text.secondary',
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {getTabDescription()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: { xs: 0.5, sm: 1 },
            display: 'block',
            fontWeight: 500,
            color: isDarkMode ? '#4a9eff' : '#127CF3',
            fontSize: { xs: '0.75rem', sm: '0.813rem' }
          }}
        >
          {getTabStats()}
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? '#2d4a6f' : 'divider',
          bgcolor: isDarkMode ? '#1a2332' : '#ffffff',
          flexShrink: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          // Ocultar scrollbar pero mantener funcionalidad
          '&::-webkit-scrollbar': {
            height: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDarkMode ? '#2d4a6f' : '#e0e0e0',
            borderRadius: '3px',
          },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 56, sm: 64 },
            '& .MuiTabs-flexContainer': {
              gap: { xs: 0, sm: 0 },
            },
            '& .MuiTab-root': {
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              minHeight: { xs: 56, sm: 64 },
              minWidth: { xs: 'auto', sm: 120 },
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              color: isDarkMode ? '#b0c4de' : 'inherit',
              flexDirection: { xs: 'row', sm: 'row' },
              gap: { xs: 1, sm: 1.5 },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              },
            },
            '& .MuiTab-root.Mui-selected': {
              color: isDarkMode ? '#4a9eff' : '#127CF3',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: isDarkMode ? '#4a9eff' : '#127CF3',
              height: 3,
            },
            '& .MuiTabs-scrollButtons': {
              color: isDarkMode ? '#b0c4de' : 'inherit',
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            },
          }}
        >
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Revendedores"
          />
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Clientes"
          />
          <Tab
            icon={<LocationIcon />}
            iconPosition="start"
            label="Sucursales"
          />
          <Tab
            icon={<ShoppingCartIcon />}
            iconPosition="start"
            label="Operaciones"
            sx={{
              '& .MuiTab-iconWrapper': {
                display: { xs: 'flex', sm: 'flex' }
              }
            }}
          />
        </Tabs>
      </Paper>

      {/* Tabla */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: isDarkMode ? '#0a0f1a' : 'transparent',
        position: 'relative',
        // Asegurar que ocupe todo el espacio disponible
        width: '100%',
        height: 0, // Truco para que flex: 1 funcione correctamente
      }}>
        <CustomTable
          data={getCurrentData()}
          columnsDef={getCurrentColumns()}
          pageSize={50}
          loading={loading}
          showFiltersToolbar={true}
          onRefresh={loadData}
          onCellEdit={handleCellEdit}
          onAddRecord={handleAddRecord}
          addRecordState={addRecordState}
          containerHeight="100%"
          rowHeight={26}
          loadingText="Cargando datos..."
          noResultsText="No hay datos disponibles"
        />
      </Box>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={closeErrorModal}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
}
