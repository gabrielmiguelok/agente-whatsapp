'use client';

/**
 * ═══════════════════════════════════════════════════════════════════
 * CUSTOM SELECT DROPDOWN - DESPLEGABLE PERSONALIZADO
 * ═══════════════════════════════════════════════════════════════════
 *
 * Componente de desplegable ultra-personalizado que mantiene la estética
 * visual según el tipo de columna:
 *
 * - COUNTRY: Muestra banderas + nombres de países
 * - BADGE: Muestra badges con colores según el valor
 * - NUMERIC: Input numérico estilizado
 * - TEXT: Textarea estilizada
 *
 * EXTREMADAMENTE ROBUSTO Y A PRUEBA DE FALLOS
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBadgeColors } from '../../CustomTableColumnsConfig';

// Imports de banderas
import AR from 'country-flag-icons/react/3x2/AR';
import BR from 'country-flag-icons/react/3x2/BR';
import CL from 'country-flag-icons/react/3x2/CL';
import CO from 'country-flag-icons/react/3x2/CO';
import MX from 'country-flag-icons/react/3x2/MX';
import ES from 'country-flag-icons/react/3x2/ES';
import US from 'country-flag-icons/react/3x2/US';
import DE from 'country-flag-icons/react/3x2/DE';
import FR from 'country-flag-icons/react/3x2/FR';
import GB from 'country-flag-icons/react/3x2/GB';
import CN from 'country-flag-icons/react/3x2/CN';
import JP from 'country-flag-icons/react/3x2/JP';
import IN from 'country-flag-icons/react/3x2/IN';
import CA from 'country-flag-icons/react/3x2/CA';
import AU from 'country-flag-icons/react/3x2/AU';

const countryFlags: Record<string, any> = {
  'Argentina': AR,
  'Brasil': BR,
  'Chile': CL,
  'Colombia': CO,
  'México': MX,
  'España': ES,
  'Estados Unidos': US,
  'Alemania': DE,
  'Francia': FR,
  'Reino Unido': GB,
  'China': CN,
  'Japón': JP,
  'India': IN,
  'Canadá': CA,
  'Australia': AU,
};

// ==================== FUNCIONES PARA AVATARES ====================
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    '#127CF3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectDropdownProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  columnType: 'country' | 'badge' | 'text' | 'foreignKey';
  colId: string;
  isDarkMode?: boolean;
  allowCreate?: boolean;  // ← Permite crear nuevas opciones
  onCreateOption?: (value: string) => Promise<void>;  // ← NUEVO: Callback para crear opción
  dataset?: string;  // ← NUEVO: Dataset para opciones dinámicas
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * COMPONENTE: CreateNewButton
 * ═══════════════════════════════════════════════════════════════════
 *
 * PRINCIPIO SOLID: Single Responsibility
 * - Responsabilidad única: Renderizar el botón de crear nueva opción
 * - No tiene lógica de búsqueda, filtrado ni selección
 * - Recibe todo como props (Dependency Injection)
 *
 * SIEMPRE VISIBLE cuando columnType='badge' y allowCreate=true
 */
interface CreateNewButtonProps {
  searchTerm: string;
  onSelect: (value: string) => void;
  isHighlighted: boolean;
  onMouseEnter: () => void;
  isDarkMode: boolean;
}

function CreateNewButton({
  searchTerm,
  onSelect,
  isHighlighted,
  onMouseEnter,
  isDarkMode,
}: CreateNewButtonProps) {
  const hasText = searchTerm.trim().length > 0;

  return (
    <li
      onMouseDown={(e) => {
        e.preventDefault();
        // Solo permitir crear si hay texto
        if (hasText) {
          onSelect(searchTerm);
        }
      }}
      onMouseEnter={onMouseEnter}
      style={{
        borderRadius: '3px',
        overflow: 'hidden',
        padding: '6px 10px',
        cursor: hasText ? 'pointer' : 'default',
        backgroundColor: isHighlighted
          ? 'rgba(18, 124, 243, 0.12)'
          : 'transparent',
        borderLeft: isHighlighted ? '3px solid #127CF3' : '3px solid transparent',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
        borderBottom: `1px solid ${isDarkMode ? '#2d4a6f' : '#e5e7eb'}`,
        paddingBottom: '10px',
        opacity: hasText ? 1 : 0.7,
        transition: 'all 150ms ease',
      }}
    >
      {hasText ? (
        // CON TEXTO: Mostrar preview del badge con color
        <>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>✨</span>
          <span style={{
            ...getBadgeColors(searchTerm, isDarkMode),
            backgroundColor: getBadgeColors(searchTerm, isDarkMode).bg,
            color: getBadgeColors(searchTerm, isDarkMode).text,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}>
            {searchTerm}
          </span>
          <span style={{
            fontSize: '10px',
            color: isDarkMode ? '#ffffff' : '#6b7280',
            marginLeft: 'auto',
            fontWeight: 500,
          }}>
            Crear nuevo
          </span>
        </>
      ) : (
        // SIN TEXTO: Mostrar placeholder instructivo
        <>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>✨</span>
          <span style={{
            fontSize: '11px',
            color: isDarkMode ? '#ffffff' : '#6b7280',
            fontStyle: 'italic',
            fontWeight: 400,
          }}>
            Escribe para crear nueva opción...
          </span>
        </>
      )}
    </li>
  );
}

export default function CustomSelectDropdown({
  value,
  options,
  onChange,
  onBlur,
  onKeyDown,
  columnType,
  colId,
  isDarkMode = false,
  allowCreate = false,
  onCreateOption,
  dataset,
}: CustomSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const safeValue = value || '';
  const [selectedValue, setSelectedValue] = useState(safeValue);

  // ========== BÚSQUEDA/FILTRADO ==========
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones según el término de búsqueda
  const filteredOptions = searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // 🔒 HARDCODED: Botón "Crear nuevo" SIEMPRE visible cuando allowCreate=true
  // Funciona para TODOS los tipos de columna, no solo badge
  const shouldShowCreateButton = allowCreate === true;

  const initialIndex = filteredOptions.findIndex((opt) => opt.value === safeValue);
  const [highlightedIndex, setHighlightedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight?: number;
    isMobile?: boolean;
    placement?: 'below' | 'above' | 'fullscreen';
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Buscar contenedor scrollable (mismo método que useCellSelection)
  const findScrollableContainer = (element: HTMLElement | null): HTMLElement | null => {
    if (!element) return null;

    // Buscar .tv-scroll primero (contenedor real de la tabla)
    const tvScroll = element.closest('.tv-scroll') as HTMLElement;
    if (tvScroll) return tvScroll;

    // Fallback: buscar cualquier contenedor con overflow
    let current = element.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;

      if (overflowY === 'auto' || overflowY === 'scroll' || overflowX === 'auto' || overflowX === 'scroll') {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════════
  // NUEVA LÓGICA ULTRA-ROBUSTA DE POSICIONAMIENTO
  // ═══════════════════════════════════════════════════════════════════
  const calculateDropdownPosition = () => {
    if (!containerRef.current || !isOpen) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollContainer = findScrollableContainer(containerRef.current);

    // Detectar mobile
    const isMobile = window.innerWidth < 768;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // MODO MOBILE: Usar fullscreen modal centrado
    if (isMobile) {
      setDropdownPosition({
        top: viewportHeight * 0.15, // 15% desde arriba
        left: 16, // 16px de margen
        width: viewportWidth - 32, // Full width con márgenes
        maxHeight: viewportHeight * 0.7, // 70% de la altura
        isMobile: true,
        placement: 'fullscreen',
      });
      return;
    }

    // MODO DESKTOP: Posicionamiento inteligente
    let top = rect.bottom + 2; // 2px gap
    let left = rect.left;
    let width = Math.max(rect.width, 200);
    let maxHeight = 320;
    let placement: 'below' | 'above' = 'below';

    // Ajustar por límites del viewport
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.left;

    // Si hay scroll container, usar sus límites también
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const containerSpaceBelow = containerRect.bottom - rect.bottom;
      const containerSpaceAbove = rect.top - containerRect.top;

      // Usar el espacio más restrictivo
      const effectiveSpaceBelow = Math.min(spaceBelow, containerSpaceBelow);
      const effectiveSpaceAbove = Math.min(spaceAbove, containerSpaceAbove);

      // Decidir posición: arriba o abajo
      if (effectiveSpaceBelow < 200 && effectiveSpaceAbove > effectiveSpaceBelow) {
        // Mostrar arriba
        placement = 'above';
        maxHeight = Math.min(320, effectiveSpaceAbove - 10);
        top = rect.top - maxHeight - 2;
      } else {
        // Mostrar abajo
        placement = 'below';
        maxHeight = Math.min(320, effectiveSpaceBelow - 10);
      }
    } else {
      // Sin scroll container, usar viewport
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        placement = 'above';
        maxHeight = Math.min(320, spaceAbove - 10);
        top = rect.top - maxHeight - 2;
      } else {
        maxHeight = Math.min(320, spaceBelow - 10);
      }
    }

    // Ajustar si se sale por la derecha
    if (left + width > viewportWidth - 16) {
      left = viewportWidth - width - 16;
    }

    // Ajustar si se sale por la izquierda
    if (left < 16) {
      left = 16;
    }

    // Asegurar altura mínima
    maxHeight = Math.max(150, maxHeight);

    setDropdownPosition({
      top,
      left,
      width,
      maxHeight,
      isMobile: false,
      placement,
    });
  };

  // Calcular posición inicial
  useEffect(() => {
    calculateDropdownPosition();
  }, [isOpen]);

  // Auto-focus al input de búsqueda al montar
  useEffect(() => {
    // Dar tiempo al portal para renderizar
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  // 🔒 SOLUCIÓN AL PROBLEMA DE SCROLL: Guardar posición inicial del scroll container
  const initialScrollPositionRef = useRef<{ top: number; left: number } | null>(null);

  // Actualizar posición en scroll/resize CON NUEVA LÓGICA ROBUSTA
  useEffect(() => {
    const scrollContainer = containerRef.current ? findScrollableContainer(containerRef.current) : null;

    // Guardar posición inicial del scroll cuando se abre el dropdown
    if (isOpen && scrollContainer && !initialScrollPositionRef.current) {
      initialScrollPositionRef.current = {
        top: scrollContainer.scrollTop,
        left: scrollContainer.scrollLeft,
      };
    }

    // 🔒 SOLUCIÓN: Prevenir scroll del contenedor mientras el dropdown está abierto (solo en mobile)
    const preventScroll = (e: Event) => {
      if (!scrollContainer || !isOpen) return;

      const isMobile = window.innerWidth < 768;
      if (!isMobile) return; // En desktop permitir scroll

      // En mobile: Restaurar posición de scroll si cambió
      if (initialScrollPositionRef.current) {
        const currentTop = scrollContainer.scrollTop;
        const currentLeft = scrollContainer.scrollLeft;

        if (
          currentTop !== initialScrollPositionRef.current.top ||
          currentLeft !== initialScrollPositionRef.current.left
        ) {
          scrollContainer.scrollTop = initialScrollPositionRef.current.top;
          scrollContainer.scrollLeft = initialScrollPositionRef.current.left;
        }
      }
    };

    if (isOpen) {
      // En mobile: agregar overlay para bloquear interacción con fondo
      const isMobile = window.innerWidth < 768;
      if (isMobile && document.body) {
        document.body.style.overflow = 'hidden';
      }

      // Recalcular posición en scroll/resize (solo en desktop)
      window.addEventListener('scroll', calculateDropdownPosition, true);
      window.addEventListener('resize', calculateDropdownPosition);

      // Prevenir scroll del contenedor (solo en mobile)
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', preventScroll, true);
      }

      return () => {
        // Restaurar overflow del body
        if (isMobile && document.body) {
          document.body.style.overflow = '';
        }

        window.removeEventListener('scroll', calculateDropdownPosition, true);
        window.removeEventListener('resize', calculateDropdownPosition);
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', preventScroll, true);
        }
        // Limpiar referencia al cerrar
        initialScrollPositionRef.current = null;
      };
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Verificar si el clic fue fuera del container Y fuera del dropdown portal
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const clickedOutsidePortal = !target.closest('.custom-dropdown-portal');

      if (clickedOutsideContainer && clickedOutsidePortal) {
        setIsOpen(false);
        onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  // Scroll al item seleccionado
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = async (optionValue: string) => {
    // Para foreignKey, necesitamos pasar el LABEL (nombre) no el VALUE (ID)
    // porque handleCellEdit busca por label para convertir a ID
    const selectedOption = options.find(opt => opt.value === optionValue || opt.label === optionValue);

    // Determinar qué valor enviar:
    // - Para foreignKey: enviar el LABEL (nombre) para que handleCellEdit lo convierta a ID
    // - Para otros tipos: enviar el VALUE
    let valueToSend = optionValue;
    if (columnType === 'foreignKey' && selectedOption) {
      valueToSend = selectedOption.label;
    }

    console.log('✅ [DROPDOWN] Seleccionando opción:', {
      colId,
      columnType,
      previousValue: selectedValue,
      optionValue,
      valueToSend,
      selectedOption,
      isNewOption: !selectedOption,
    });

    // Si es una nueva opción y hay callback, llamarlo
    const isNewOption = !selectedOption;
    if (isNewOption && onCreateOption) {
      try {
        await onCreateOption(optionValue);
        console.log('✨ [DROPDOWN] Nueva opción creada en backend');
      } catch (error) {
        console.warn('⚠️ [DROPDOWN] Error al crear opción en backend, continuando localmente:', error);
      }
    }

    // CRÍTICO: Actualizar estado local PRIMERO (usar label para foreignKey)
    setSelectedValue(valueToSend);

    // CRÍTICO: Llamar onChange de forma síncrona (pasar label para foreignKey)
    onChange(valueToSend);

    // CRÍTICO: Cerrar dropdown DESPUÉS de propagar el cambio
    setIsOpen(false);

    // CRÍTICO: Ejecutar onBlur de forma síncrona para guardar INMEDIATAMENTE
    // No usar setTimeout que puede causar race conditions
    console.log('🔄 [DROPDOWN] Ejecutando blur INMEDIATO para guardar');
    onBlur();
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const totalItems = (shouldShowCreateButton ? 1 : 0) + filteredOptions.length;
      setHighlightedIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();

      const trimmedSearch = searchTerm.trim();

      // CREAR AUTOMÁTICAMENTE: Si allowCreate=true, hay texto, y NO hay coincidencia exacta
      if (allowCreate && trimmedSearch.length > 0) {
        const exactMatch = options.find(opt =>
          opt.value.toLowerCase() === trimmedSearch.toLowerCase() ||
          opt.label.toLowerCase() === trimmedSearch.toLowerCase()
        );

        // Si NO hay coincidencia exacta -> CREAR AUTOMÁTICAMENTE
        if (!exactMatch) {
          console.log('✨ [AUTO-CREATE] Creando nueva opción:', trimmedSearch);
          handleSelect(trimmedSearch);
          onKeyDown(e);
          return;
        }
      }

      // Si está en el índice 0 y hay botón crear Y HAY TEXTO, crear nueva opción
      if (shouldShowCreateButton && highlightedIndex === 0 && trimmedSearch.length > 0) {
        handleSelect(trimmedSearch);
      } else if (shouldShowCreateButton && highlightedIndex === 0 && trimmedSearch.length === 0) {
        // Si está en "Crear" pero no hay texto, no hacer nada
        return;
      } else {
        // Ajustar índice si hay botón de crear (está en posición 0)
        const adjustedIndex = shouldShowCreateButton ? highlightedIndex - 1 : highlightedIndex;
        if (adjustedIndex >= 0 && adjustedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[adjustedIndex].value);
        }
      }
      onKeyDown(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      onKeyDown(e);
    } else if (e.key !== 'Tab') {
      // Permitir tipeo en el input de búsqueda (no propagar a parent)
      e.stopPropagation();
    }
  };

  const renderOption = (option: SelectOption, isHighlighted: boolean, isSelected: boolean) => {
    const baseStyle: React.CSSProperties = {
      padding: '4px 8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: isHighlighted
        ? 'rgba(18, 124, 243, 0.12)'
        : isSelected
        ? 'rgba(18, 124, 243, 0.06)'
        : 'transparent',
      transition: 'background-color 150ms ease',
      borderLeft: isSelected ? '3px solid #127CF3' : '3px solid transparent',
      minHeight: '26px',
    };

    if (columnType === 'country') {
      const FlagComponent = countryFlags[option.value];
      return (
        <div style={baseStyle}>
          {FlagComponent && <FlagComponent style={{ width: '18px', height: '12px', borderRadius: '2px', flexShrink: 0 }} />}
          <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400 }}>{option.label}</span>
        </div>
      );
    }

    if (columnType === 'badge') {
      // ✅ USAR LA FUNCIÓN CENTRALIZADA para colores automáticos CON MODO OSCURO
      const colors = getBadgeColors(option.value, isDarkMode);
      return (
        <div style={baseStyle}>
          <span
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              padding: '3px 8px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 500,
              display: 'inline-block',
              whiteSpace: 'nowrap',
              lineHeight: '1.2',
            }}
          >
            {option.label}
          </span>
        </div>
      );
    }

    if (columnType === 'foreignKey') {
      // Renderizar con avatar + nombre (igual que renderForeignKeyCell)
      const initials = getInitials(option.label);
      const bgColor = getAvatarColor(option.label);

      return (
        <div style={baseStyle}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: bgColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400 }}>{option.label}</span>
        </div>
      );
    }

    // Default (text)
    return (
      <div style={baseStyle}>
        <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400 }}>{option.label}</span>
      </div>
    );
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Renderizar dropdown usando Portal con OVERLAY en mobile
  const dropdownContent = isOpen && dropdownPosition ? (
    <>
      {/* Overlay oscuro en mobile */}
      {dropdownPosition.isMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99998,
            backdropFilter: 'blur(2px)',
          }}
          className="custom-dropdown-overlay"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsOpen(false);
            onBlur();
          }}
        />
      )}

      {/* Dropdown */}
      <div
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
          border: dropdownPosition.isMobile ? 'none' : `2px solid ${isDarkMode ? '#2d4a6f' : '#127CF3'}`,
          borderRadius: dropdownPosition.isMobile ? '12px' : '6px',
          boxShadow: dropdownPosition.isMobile
            ? '0 20px 60px rgba(0, 0, 0, 0.8)'
            : isDarkMode
            ? '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(45, 74, 111, 0.5)'
            : '0 8px 24px rgba(18, 124, 243, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          zIndex: 99999,
          maxHeight: `${dropdownPosition.maxHeight || 280}px`,
          display: 'flex',
          flexDirection: 'column',
          transform: dropdownPosition.isMobile ? 'none' : undefined,
          animation: dropdownPosition.isMobile ? 'slideUpFade 0.2s ease-out' : undefined,
        }}
        className="custom-dropdown-portal"
      >
      {/* ========== TÍTULO Y BOTÓN CERRAR (solo mobile) ========== */}
      {dropdownPosition.isMobile && (
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${isDarkMode ? '#2d4a6f' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
          }}>
            Seleccionar opción
          </h3>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setIsOpen(false);
              onBlur();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: isDarkMode ? '#ffffff' : '#6b7280',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ========== INPUT DE BÚSQUEDA ========== */}
      <div style={{
        padding: dropdownPosition.isMobile ? '12px 16px' : '8px',
        borderBottom: `1px solid ${isDarkMode ? '#2d4a6f' : '#e5e7eb'}`,
      }}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar o crear..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0); // Reset highlight al buscar
          }}
          onKeyDown={handleKeyDownInternal}
          style={{
            width: '100%',
            padding: dropdownPosition.isMobile ? '10px 12px' : '6px 8px',
            border: `1px solid ${isDarkMode ? '#2d4a6f' : '#d1d5db'}`,
            borderRadius: dropdownPosition.isMobile ? '8px' : '4px',
            fontSize: dropdownPosition.isMobile ? '14px' : '12px',
            backgroundColor: isDarkMode ? '#0f1722' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
            outline: 'none',
          }}
        />
      </div>

      {/* Lista de opciones */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: `${(dropdownPosition.maxHeight || 280) - 60}px`, // Restar altura del input
      }}>
        <ul
          ref={listRef}
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '3px',
          }}
        >
          {/* ========== HARDCODED: BOTÓN CREAR NUEVO - SIEMPRE VISIBLE ========== */}
          {/* PRINCIPIO: Single Responsibility - Componente dedicado solo a crear */}
          {shouldShowCreateButton && (
            <CreateNewButton
              searchTerm={searchTerm}
              onSelect={handleSelect}
              isHighlighted={highlightedIndex === 0}
              onMouseEnter={() => setHighlightedIndex(0)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* SEGUNDO: Opciones filtradas */}
          {filteredOptions.map((option, index) => {
            // Ajustar índice: si hay botón crear, el primer item real tiene índice 1
            const actualIndex = shouldShowCreateButton ? index + 1 : index;
            return (
              <li
                key={option.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option.value);
                }}
                onMouseEnter={() => setHighlightedIndex(actualIndex)}
                style={{
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                {renderOption(option, highlightedIndex === actualIndex, selectedValue === option.value)}
              </li>
            );
          })}

          {/* Mensaje si no hay resultados Y no hay botón crear */}
          {!shouldShowCreateButton && filteredOptions.length === 0 && (
            <li style={{
              padding: '12px 8px',
              textAlign: 'center',
              color: isDarkMode ? '#ffffff' : '#9ca3af',
              fontSize: '11px',
            }}>
              No se encontraron resultados
            </li>
          )}
        </ul>
      </div>
    </div>
    </>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDownInternal}
        onBlur={(e) => {
          // Solo hacer blur si el click es fuera del componente
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            onBlur();
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
        }}
      >
        {/* Placeholder invisible para mantener el espacio */}
        <span style={{ visibility: 'hidden', fontSize: '11px' }}>Editando...</span>
      </div>

      {/* Renderizar dropdown en portal (fuera del DOM de la tabla) */}
      {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}
