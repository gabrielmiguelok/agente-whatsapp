'use client';

import React from 'react';
import { Box, Typography, Select, MenuItem, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ table }: { table: any }) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, totalRows);
  const isShowingAll = pageSize >= totalRows;

  const handlePageSizeChange = (newSize: number) => {
    // Si selecciona "Todos", usar el total de filas
    const actualSize = newSize === 999999 ? totalRows : newSize;
    table.setPageSize(actualSize);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        p: '6px 12px',
        backgroundColor: 'var(--color-bg-paper)',
        color: 'var(--color-text)',
        minHeight: '36px',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 500, mr: 0.5 }}>
        Filas por página:
      </Typography>

      <Select
        size="small"
        value={isShowingAll ? 999999 : pageSize}
        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        sx={{ minWidth: '70px', fontSize: '0.75rem', color: 'inherit', '& .MuiSelect-select': { p: '4px' } }}
      >
        {[50, 100, 200, 500].map((size) => (
          <MenuItem key={size} value={size} sx={{ fontSize: '0.75rem', p: '4px 8px' }}>
            {size}
          </MenuItem>
        ))}
        <MenuItem value={999999} sx={{ fontSize: '0.75rem', p: '4px 8px' }}>
          Todos
        </MenuItem>
      </Select>

      <Typography variant="caption" sx={{ fontSize: '0.75rem', mx: 1 }}>
        {isShowingAll ? `${totalRows} de ${totalRows}` : `${from}-${to} de ${totalRows}`}
      </Typography>

      {!isShowingAll && (
        <>
          <IconButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            size="small"
            sx={{ p: 0.5, color: 'inherit' }}
          >
            <ChevronLeft size={20} />
          </IconButton>

          <IconButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            size="small"
            sx={{ p: 0.5, color: 'inherit' }}
          >
            <ChevronRight size={20} />
          </IconButton>
        </>
      )}
    </Box>
  );
}
