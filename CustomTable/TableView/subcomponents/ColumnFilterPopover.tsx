'use client';

import React from 'react';
import { Popover } from '@mui/material';
import ColumnFilterConfiguration from '../../ColumnConfiguration';

export default function ColumnFilterPopover({
  anchorEl,
  menuColumnId,
  handleCloseMenu,
  columnFilters,
  updateColumnFilter,
  originalColumnsDef,
}: {
  anchorEl: HTMLElement | null;
  menuColumnId: string | null;
  handleCloseMenu: () => void;
  columnFilters: Record<string, any>;
  updateColumnFilter: (colId: string, patch: any) => void;
  originalColumnsDef: Array<{ accessorKey: string; isNumeric?: boolean }>;
}) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <ColumnFilterConfiguration
        menuColumnId={menuColumnId || undefined}
        columnFilters={columnFilters}
        updateColumnFilter={updateColumnFilter}
        originalColumnsDef={originalColumnsDef}
      />
    </Popover>
  );
}
