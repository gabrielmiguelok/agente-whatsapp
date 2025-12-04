/**
 * Archivo: /components/CustomTable/toolbar/FiltersToolbar.tsx
 * LICENSE: MIT
 */
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { IconButton, Tooltip, TextField, Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material"
import { Moon, Sun, ChevronLeft, ChevronRight, Plus, Save, Check, LayoutGrid, Table2, ChevronDown, Columns3 } from "lucide-react"

export type AddRecordState = 'idle' | 'adding' | 'saving' | 'confirmed';
export type ViewMode = 'table' | 'board';

export type SelectFieldOption = {
  accessorKey: string;
  header: string;
};

export interface FiltersToolbarProps {
  globalFilterValue?: string
  onGlobalFilterChange: (value: string) => void
  onDownloadExcel?: () => void
  onRefresh?: () => void
  onThemeToggle?: () => void
  isDarkMode?: boolean
  paginationInfo?: {
    currentPage: number
    totalPages: number
    total: number
    onPageChange: (page: number) => void
  }
  onAddRecord?: () => void
  addRecordState?: AddRecordState
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  selectFields?: SelectFieldOption[]
  groupByField?: string
  onGroupByFieldChange?: (field: string) => void
  onAddColumn?: (columnName: string) => Promise<boolean>
}

export default function FiltersToolbar({
  globalFilterValue = "",
  onGlobalFilterChange,
  onDownloadExcel,
  onRefresh,
  onThemeToggle,
  isDarkMode = false,
  paginationInfo,
  onAddRecord,
  addRecordState = 'idle',
  viewMode = 'table',
  onViewModeChange,
  selectFields = [],
  groupByField,
  onGroupByFieldChange,
  onAddColumn,
}: FiltersToolbarProps) {
  const [viewMenuAnchor, setViewMenuAnchor] = useState<HTMLElement | null>(null);
  const viewMenuOpen = Boolean(viewMenuAnchor);

  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [addColumnLoading, setAddColumnLoading] = useState(false);

  const handleThemeToggle = () => {
    if (onThemeToggle) onThemeToggle()
  }

  const handleViewMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewMenuAnchor(event.currentTarget);
  };

  const handleViewMenuClose = () => {
    setViewMenuAnchor(null);
  };

  const handleViewModeSelect = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    handleViewMenuClose();
  };

  const handleGroupBySelect = (field: string) => {
    if (onGroupByFieldChange) {
      onGroupByFieldChange(field);
    }
    if (onViewModeChange && viewMode !== 'board') {
      onViewModeChange('board');
    }
    handleViewMenuClose();
  };

  const handleAddColumnSubmit = async () => {
    if (!newColumnName.trim() || !onAddColumn) return;
    setAddColumnLoading(true);
    try {
      const success = await onAddColumn(newColumnName.trim());
      if (success) {
        setNewColumnName('');
        setAddColumnDialogOpen(false);
      }
    } finally {
      setAddColumnLoading(false);
    }
  };

  // Theme colors
  const colors = isDarkMode
    ? {
        bg: "oklch(0.15 0.01 240)",
        text: "oklch(0.98 0.002 240)",
        inputBg: "oklch(0.18 0.01 240)",
        inputText: "oklch(0.98 0.002 240)",
        inputBorder: "oklch(0.22 0.02 240)",
        placeholder: "oklch(0.6 0.02 240)",
      }
    : {
        bg: "oklch(0.99 0.002 240)",
        text: "oklch(0.2 0.04 240)",
        inputBg: "oklch(1 0 0)",
        inputText: "oklch(0.2 0.04 240)",
        inputBorder: "oklch(0.92 0.004 240)",
        placeholder: "oklch(0.5 0.02 240)",
      }

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: colors.bg,
    height: "48px",
    maxWidth: "100%",
    padding: "0 8px",
    gap: "8px",
    boxSizing: "border-box",
  }

  return (
    <div style={toolbarStyle}>
      {/* Filtro global */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Búsqueda global"
        value={globalFilterValue}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        sx={{
          width: "220px",
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.inputBg,
            borderRadius: "8px",
            minHeight: "32px",
            lineHeight: 1.2,
            "& fieldset": {
              borderColor: colors.inputBorder,
            },
            "&:hover fieldset": {
              borderColor: "#127CF3",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#127CF3",
              borderWidth: "2px",
            },
            "& input": {
              padding: "6px 12px",
              fontSize: "0.875rem",
              color: colors.inputText,
              "&::placeholder": {
                color: colors.placeholder,
                opacity: 1,
              },
            },
          },
        }}
      />

      {/* Agregar nueva columna */}
      {onAddColumn && (
        <Tooltip title="Agregar nueva columna" arrow>
          <IconButton
            size="small"
            onClick={() => setAddColumnDialogOpen(true)}
            sx={{
              color: '#10b981',
              '&:hover': {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              },
            }}
            aria-label="Agregar columna"
          >
            <Columns3 size={18} />
          </IconButton>
        </Tooltip>
      )}

      {/* Dialog para agregar columna */}
      <Dialog
        open={addColumnDialogOpen}
        onClose={() => !addColumnLoading && setAddColumnDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            style: { backgroundColor: 'rgba(0,0,0,0.5)' }
          }
        }}
        sx={{
          zIndex: 99999,
          '& .MuiDialog-paper': {
            backgroundColor: isDarkMode ? 'oklch(0.18 0.01 240)' : '#ffffff',
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={{
          color: isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937',
          fontWeight: 600,
          fontSize: '16px',
        }}>
          Nueva columna
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Nombre de la columna"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newColumnName.trim()) {
                handleAddColumnSubmit();
              }
            }}
            disabled={addColumnLoading}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDarkMode ? 'oklch(0.14 0.01 240)' : '#f9fafb',
                '& fieldset': {
                  borderColor: isDarkMode ? 'oklch(0.25 0.02 240)' : '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: '#127CF3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#127CF3',
                },
              },
              '& input': {
                color: isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937',
              },
            }}
          />
          <p style={{
            fontSize: '12px',
            color: isDarkMode ? 'oklch(0.6 0.02 240)' : '#6b7280',
            marginTop: '8px',
          }}>
            Se creará un nuevo campo en la tabla de contactos
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: '12px 24px 16px' }}>
          <Button
            onClick={() => setAddColumnDialogOpen(false)}
            disabled={addColumnLoading}
            sx={{
              color: isDarkMode ? 'oklch(0.7 0.02 240)' : '#6b7280',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddColumnSubmit}
            disabled={!newColumnName.trim() || addColumnLoading}
            variant="contained"
            sx={{
              backgroundColor: '#127CF3',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#0f6ad3',
              },
              '&.Mui-disabled': {
                backgroundColor: isDarkMode ? 'oklch(0.25 0.02 240)' : '#e5e7eb',
              },
            }}
          >
            {addColumnLoading ? 'Creando...' : 'Crear columna'}
          </Button>
        </DialogActions>
      </Dialog>

      {paginationInfo && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <span style={{ fontSize: "13px", color: colors.text }}>
            Página {paginationInfo.currentPage} de {paginationInfo.totalPages} ({paginationInfo.total} registros)
          </span>
          <Tooltip title="Página anterior" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => paginationInfo.onPageChange(paginationInfo.currentPage - 1)}
                disabled={paginationInfo.currentPage <= 1}
                sx={{ color: colors.text }}
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Página siguiente" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => paginationInfo.onPageChange(paginationInfo.currentPage + 1)}
                disabled={paginationInfo.currentPage >= paginationInfo.totalPages}
                sx={{ color: colors.text }}
                aria-label="Página siguiente"
              >
                <ChevronRight size={20} />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      )}

      {/* Agregar nuevo registro */}
      {onAddRecord && (
        <Tooltip
          title={
            addRecordState === 'idle' ? 'Agregar nuevo registro' :
            addRecordState === 'adding' ? 'Guardar registro' :
            addRecordState === 'saving' ? 'Guardando...' :
            'Registro guardado'
          }
          arrow
        >
          <span>
            <IconButton
              size="small"
              onClick={onAddRecord}
              disabled={addRecordState === 'saving' || addRecordState === 'confirmed'}
              sx={{
                color: addRecordState === 'idle' ? '#127CF3' :
                       addRecordState === 'adding' ? '#f59e0b' :
                       addRecordState === 'confirmed' ? '#10b981' :
                       colors.text,
                marginLeft: paginationInfo ? 0 : "auto",
                backgroundColor: addRecordState === 'adding' ? 'rgba(245, 158, 11, 0.1)' :
                                 addRecordState === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' :
                                 'transparent',
                '&:hover': {
                  backgroundColor: addRecordState === 'idle' ? 'rgba(18, 124, 243, 0.1)' :
                                   addRecordState === 'adding' ? 'rgba(245, 158, 11, 0.2)' :
                                   addRecordState === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' :
                                   undefined,
                },
                '&.Mui-disabled': {
                  color: colors.text,
                  opacity: 0.5,
                }
              }}
              aria-label={
                addRecordState === 'idle' ? 'Agregar registro' :
                addRecordState === 'adding' ? 'Guardar' :
                'Guardando'
              }
            >
              {addRecordState === 'idle' && <Plus size={18} />}
              {addRecordState === 'adding' && <Save size={18} />}
              {(addRecordState === 'saving' || addRecordState === 'confirmed') && <Check size={18} />}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Selector de vista (Tabla / Tablero) */}
      {selectFields && selectFields.length > 0 && onViewModeChange && (
        <>
          <Tooltip title={viewMode === 'table' ? 'Cambiar a vista tablero' : 'Cambiar a vista tabla'} arrow>
            <IconButton
              size="small"
              onClick={handleViewMenuOpen}
              sx={{
                color: viewMode === 'board' ? '#127CF3' : colors.text,
                marginLeft: (paginationInfo || onAddRecord) ? 0 : "auto",
                backgroundColor: viewMode === 'board' ? 'rgba(18, 124, 243, 0.1)' : 'transparent',
                borderRadius: '6px',
                padding: '4px 8px',
                gap: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(18, 124, 243, 0.1)',
                },
              }}
              aria-label="Cambiar vista"
            >
              {viewMode === 'table' ? <Table2 size={16} /> : <LayoutGrid size={16} />}
              <ChevronDown size={14} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={viewMenuAnchor}
            open={viewMenuOpen}
            onClose={handleViewMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            disablePortal={false}
            slotProps={{
              root: {
                style: { zIndex: 99999 }
              }
            }}
            sx={{
              zIndex: 99999,
              '& .MuiPaper-root': {
                backgroundColor: isDarkMode ? 'oklch(0.18 0.01 240)' : '#ffffff',
                border: `1px solid ${isDarkMode ? 'oklch(0.25 0.02 240)' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxShadow: isDarkMode
                  ? '0 4px 20px rgba(0,0,0,0.4)'
                  : '0 4px 20px rgba(0,0,0,0.1)',
                minWidth: '180px',
              },
            }}
          >
            {/* Vista Tabla */}
            <MenuItem
              onClick={() => handleViewModeSelect('table')}
              selected={viewMode === 'table'}
              sx={{
                fontSize: '13px',
                padding: '8px 14px',
                gap: '10px',
                color: isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(18, 124, 243, 0.1)',
                },
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <Table2 size={16} />
              Vista Tabla
            </MenuItem>

            <Divider sx={{ my: 0.5, borderColor: isDarkMode ? 'oklch(0.25 0.02 240)' : '#e5e7eb' }} />

            {/* Opciones de Tablero por campo */}
            <div style={{
              padding: '6px 14px 4px',
              fontSize: '10px',
              fontWeight: 600,
              color: isDarkMode ? 'oklch(0.6 0.02 240)' : '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Tablero por
            </div>

            {selectFields.map((field) => (
              <MenuItem
                key={field.accessorKey}
                onClick={() => handleGroupBySelect(field.accessorKey)}
                selected={viewMode === 'board' && groupByField === field.accessorKey}
                sx={{
                  fontSize: '13px',
                  padding: '8px 14px',
                  gap: '10px',
                  color: isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(18, 124, 243, 0.1)',
                  },
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <LayoutGrid size={16} />
                {field.header}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {/* Descargar Excel (opcional) */}
      {onDownloadExcel && (
        <Tooltip title="Descargar datos en formato Excel" arrow>
          <IconButton
            size="small"
            onClick={onDownloadExcel}
            sx={{ color: colors.text, marginLeft: (!selectFields || selectFields.length === 0) && !paginationInfo && !onAddRecord ? "auto" : 0 }}
            aria-label="Descargar Excel"
          >
            <svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18h14v2H5z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Tema */}
      <Tooltip title="Cambiar entre modo claro y oscuro" arrow>
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            color: colors.text,
            fontSize: "18px",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(18,124,243,0.12)" : "rgba(18,124,243,0.08)",
            }
          }}
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </Tooltip>

      {/* Refrescar (opcional) */}
      {onRefresh && (
        <Tooltip title="Refrescar datos" arrow>
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{ color: colors.text }}
            aria-label="Refrescar"
          >
            <svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24">
              <path d="M13 2v2a7 7 0 0 1 6.935 6.058l1.928-.517A9 9 0 0 0 13 2zm-2 0a9 9 0 0 0-8.863 7.541l1.928.517A7 7 0 0 1 11 4V2zM4.137 14.925l-1.928.517A9 9 0 0 0 11 22v-2a7 7 0 0 1-6.863-5.075zM13 22a9 9 0 0 0 8.863-7.541l-1.928-.517A7 7 0 0 1 13 20v2z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}
