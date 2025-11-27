'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';

export default function ContextualMenu({
  contextMenu,
  handleCloseContextMenu,
  handleCopyFromMenu,
  clickedHeaderIndex,
  onHideColumns,
  handleHideColumn,
  clickedRowIndex,
  onHideRows,
  handleHideRow,
}: {
  contextMenu: { mouseX: number; mouseY: number } | null;
  handleCloseContextMenu: () => void;
  handleCopyFromMenu: () => void;
  clickedHeaderIndex: number | null;
  onHideColumns?: (ids: string[]) => void;
  handleHideColumn: () => void;
  clickedRowIndex: number | null;
  onHideRows?: (rows: number[]) => void;
  handleHideRow: () => void;
}) {
  const BRAND = '#127CF3'; // Synara primary blue
  const LIGHT = {
    paper: 'oklch(1 0 0)',
    text: 'oklch(0.2 0.04 240)',
    divider: 'oklch(0.92 0.004 240)',
    hover: 'rgba(18,124,243,0.08)',
    shadow: '0 10px 24px rgba(18,124,243,0.08)',
  };
  const DARK = {
    paper: 'oklch(0.15 0.01 240)',
    text: 'oklch(0.98 0.002 240)',
    divider: 'oklch(0.22 0.02 240)',
    hover: 'rgba(18,124,243,0.16)',
    shadow: '0 10px 24px rgba(0,0,0,0.28)',
  };

  const getIsDark = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(getIsDark());
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handler = () => setIsDark(!!mql?.matches);
    mql?.addEventListener?.('change', handler);
    return () => mql?.removeEventListener?.('change', handler);
  }, []);

  const C = isDark ? DARK : LIGHT;

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleCloseContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      disablePortal={false}
      slotProps={{
        root: {
          style: { zIndex: 99999 }
        }
      }}
      sx={{ zIndex: 99999 }}
      PaperProps={{
        sx: {
          bgcolor: C.paper,
          color: C.text,
          border: `1px solid ${C.divider}`,
          boxShadow: `${C.shadow}, 0 0 0 1px rgba(18,124,243,0.10)`,
        },
      }}
      MenuListProps={{
        sx: {
          py: 0.5,
          '& .MuiMenuItem-root': {
            fontSize: 13,
            '&:hover': { bgcolor: C.hover },
            '&:active': { bgcolor: C.hover, outline: `1px solid ${BRAND}` },
          },
        },
      }}
    >
      <MenuItem onClick={handleCopyFromMenu}>Copiar</MenuItem>

      {onHideColumns && clickedHeaderIndex != null && (
        <MenuItem onClick={handleHideColumn}>Ocultar columna</MenuItem>
      )}

      {onHideRows && clickedRowIndex != null && (
        <MenuItem onClick={handleHideRow}>Ocultar fila</MenuItem>
      )}
    </Menu>
  );
}
