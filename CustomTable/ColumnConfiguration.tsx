'use client';

import React from 'react';
import { Box, Select, MenuItem, SelectChangeEvent } from '@mui/material';

type ColumnDef = {
  accessorKey: string;
  isNumeric?: boolean;
  isDate?: boolean;
};

type ColumnFilters = Record<
  string,
  {
    operator?: string;
    value?: string;
    min?: number;
    max?: number;
    exact?: number;
    dateFrom?: string;
    dateTo?: string;
    sortDirection?: 'none' | 'asc' | 'desc';
  }
>;

export default function ColumnFilterConfiguration({
  menuColumnId,
  columnFilters,
  updateColumnFilter,
  originalColumnsDef,
}: {
  menuColumnId?: string | null;
  columnFilters: ColumnFilters;
  updateColumnFilter: (colId: string, patch: Partial<ColumnFilters[string]>) => void;
  originalColumnsDef: ColumnDef[];
}) {
  if (!menuColumnId) return null;

  const BRAND = '#127CF3'; // Synara primary blue
  const LIGHT = {
    text: 'oklch(0.2 0.04 240)',
    bg: 'oklch(1 0 0)',
    divider: 'oklch(0.92 0.004 240)',
    hoverBorder: BRAND,
    popBg: 'oklch(1 0 0)',
    popText: 'oklch(0.2 0.04 240)',
    popBorder: 'oklch(0.92 0.004 240)',
    shadow: '0 10px 24px rgba(18,124,243,.12)',
    inputShadow: '0 2px 8px rgba(18,124,243,.06)',
  };
  const DARK = {
    text: 'oklch(0.98 0.002 240)',
    bg: 'oklch(0.12 0.01 240)',
    divider: 'oklch(0.22 0.02 240)',
    hoverBorder: BRAND,
    popBg: 'oklch(0.12 0.01 240)',
    popText: 'oklch(0.98 0.002 240)',
    popBorder: 'oklch(0.22 0.02 240)',
    shadow: '0 10px 24px rgba(0,0,0,.5)',
    inputShadow: '0 2px 8px rgba(18,124,243,.10)',
  };

  // Usamos el color del documento actual para inferir modo (light/dark) de forma simple
  const isDark = typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).colorScheme === 'dark' ||
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    : false;

  const C = isDark ? DARK : LIGHT;

  const operatorsText = [
    { label: 'Contiene', value: 'contains' },
    { label: 'Empieza con', value: 'startsWith' },
    { label: 'Termina con', value: 'endsWith' },
    { label: 'Igual a', value: 'equals' },
  ];

  const operatorsNumeric = [
    { label: 'Rango', value: 'range' },
    { label: 'Exacto', value: 'exact' },
  ];

  const operatorsDate = [
    { label: 'Rango de fechas', value: 'dateRange' },
  ];

  const sortTextOptions = [
    { label: 'Sin orden', value: 'none' },
    { label: 'A-Z', value: 'asc' },
    { label: 'Z-A', value: 'desc' },
  ] as const;

  const sortNumOptions = [
    { label: 'Sin orden', value: 'none' },
    { label: 'Asc', value: 'asc' },
    { label: 'Desc', value: 'desc' },
  ] as const;

  const sortDateOptions = [
    { label: 'Sin orden', value: 'none' },
    { label: 'Más reciente', value: 'desc' },
    { label: 'Más antigua', value: 'asc' },
  ] as const;

  const inputStyles: React.CSSProperties = {
    width: '100%',
    fontSize: '0.8rem',
    padding: '4px',
    borderRadius: 6,
    border: `1px solid ${C.divider}`,
    backgroundColor: C.bg,
    color: C.text,
    outline: 'none',
    boxShadow: C.inputShadow,
  };

  const currentFilter = columnFilters[menuColumnId] || {};
  const currentColDef = originalColumnsDef.find((c) => c.accessorKey === menuColumnId);
  const isNumeric = currentColDef?.isNumeric || false;
  const isDate = currentColDef?.isDate || false;
  const currentOperator = currentFilter.operator || (isDate ? 'dateRange' : isNumeric ? 'range' : 'contains');
  const sortDirection: 'none' | 'asc' | 'desc' = (currentFilter.sortDirection as any) || 'none';
  const sortOptions = isDate ? sortDateOptions : isNumeric ? sortNumOptions : sortTextOptions;

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: C.popBg,
        color: C.popText,
        border: `1px solid ${C.popBorder}`,
        boxShadow: C.shadow,
      },
    },
  };

  const handleOperatorChange = (e: SelectChangeEvent<string>) =>
    updateColumnFilter(menuColumnId, { operator: e.target.value });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateColumnFilter(menuColumnId, { value: e.target.value });

  const normalizeNumber = (val: string) => {
    if (val === '') return undefined;
    return Number(val.replace(',', '.'));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { min: val });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { max: val });
  };

  const handleExactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { exact: val });
  };

  const handleSortChange = (e: SelectChangeEvent<'none' | 'asc' | 'desc'>) => {
    updateColumnFilter(menuColumnId, { sortDirection: e.target.value as any });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateColumnFilter(menuColumnId, { dateFrom: e.target.value });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateColumnFilter(menuColumnId, { dateTo: e.target.value });
  };

  return (
    <Box
      sx={{
        p: 1,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: C.bg,
        border: `1px solid ${C.divider}`,
        color: C.text,
        borderRadius: '8px',
        boxShadow: isDark ? '0 8px 22px rgba(155,89,255,.10)' : '0 8px 22px rgba(155,89,255,.10)',
      }}
    >
      {/* Orden */}
      <Select
        size="small"
        value={sortDirection}
        onChange={handleSortChange}
        sx={{
          fontSize: '0.8rem',
          backgroundColor: C.bg,
          color: C.text,
          '& fieldset': { borderColor: C.divider + ' !important' },
          '&:hover fieldset': { borderColor: BRAND + ' !important' },
          '&.Mui-focused fieldset': { borderColor: BRAND + ' !important' },
        }}
        MenuProps={menuProps}
      >
        {sortOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ fontSize: '0.8rem', color: C.text }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* Filtros */}
      {isDate ? (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{
              fontSize: '0.8rem',
              backgroundColor: C.bg,
              color: C.text,
              '& fieldset': { borderColor: C.divider + ' !important' },
              '&:hover fieldset': { borderColor: BRAND + ' !important' },
              '&.Mui-focused fieldset': { borderColor: BRAND + ' !important' },
            }}
            MenuProps={menuProps}
          >
            {operatorsDate.map((op) => (
              <MenuItem key={op.value} value={op.value} sx={{ fontSize: '0.8rem', color: C.text }}>
                {op.label}
              </MenuItem>
            ))}
          </Select>

          {currentOperator === 'dateRange' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="date"
                placeholder="Desde"
                value={currentFilter.dateFrom ?? ''}
                onChange={handleDateFromChange}
                style={inputStyles}
              />
              <input
                type="date"
                placeholder="Hasta"
                value={currentFilter.dateTo ?? ''}
                onChange={handleDateToChange}
                style={inputStyles}
              />
            </Box>
          )}
        </>
      ) : isNumeric ? (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{
              fontSize: '0.8rem',
              backgroundColor: C.bg,
              color: C.text,
              '& fieldset': { borderColor: C.divider + ' !important' },
              '&:hover fieldset': { borderColor: BRAND + ' !important' },
              '&.Mui-focused fieldset': { borderColor: BRAND + ' !important' },
            }}
            MenuProps={menuProps}
          >
            {operatorsNumeric.map((op) => (
              <MenuItem key={op.value} value={op.value} sx={{ fontSize: '0.8rem', color: C.text }}>
                {op.label}
              </MenuItem>
            ))}
          </Select>

          {currentOperator === 'range' && (
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                placeholder="Mín"
                value={currentFilter.min ?? ''}
                onChange={handleMinChange}
                style={{ ...inputStyles, width: '60px' }}
              />
              <input
                type="number"
                placeholder="Máx"
                value={currentFilter.max ?? ''}
                onChange={handleMaxChange}
                style={{ ...inputStyles, width: '60px' }}
              />
            </Box>
          )}

          {currentOperator === 'exact' && (
            <input
              type="number"
              placeholder="Valor exacto"
              value={currentFilter.exact ?? ''}
              onChange={handleExactNumberChange}
              style={inputStyles}
            />
          )}
        </>
      ) : (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{
              fontSize: '0.8rem',
              backgroundColor: C.bg,
              color: C.text,
              '& fieldset': { borderColor: C.divider + ' !important' },
              '&:hover fieldset': { borderColor: BRAND + ' !important' },
              '&.Mui-focused fieldset': { borderColor: BRAND + ' !important' },
            }}
            MenuProps={menuProps}
          >
            {operatorsText.map((op) => (
              <MenuItem key={op.value} value={op.value} sx={{ fontSize: '0.8rem', color: C.text }}>
                {op.label}
              </MenuItem>
            ))}
          </Select>

          <input
            type="text"
            placeholder="Buscar..."
            value={currentFilter.value || ''}
            onChange={handleSearchChange}
            style={inputStyles}
          />
        </>
      )}
    </Box>
  );
}
