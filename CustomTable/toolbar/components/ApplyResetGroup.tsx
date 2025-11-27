/**
 * Archivo: /components/CustomTable/toolbar/components/ApplyResetGroup.tsx
 */
'use client';

import React, { memo, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { SxProps, Theme } from '@mui/material/styles';

class FilterApplyFlow {
  constructor(private onApplyFilters: () => void) {}
  applyAll() {
    this.onApplyFilters();
  }
}

class FilterResetFlow {
  constructor(private onResetFilters: () => void) {}
  resetAll() {
    this.onResetFilters();
  }
}

const BUTTON_STYLES: SxProps<Theme> = {
  transition: 'none !important',
  backgroundColor: 'transparent !important',
  p: 0.3,
  mr: 0.5,
  fontSize: '18px',
  '&:hover': {
    backgroundColor: '#eee !important'
  }
};

export interface ApplyResetGroupProps {
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onRefresh?: () => void | Promise<void>;
  sxButton?: SxProps<Theme>;
}

function ApplyResetGroup({
  onApplyFilters,
  onResetFilters,
  onRefresh,
  sxButton
}: ApplyResetGroupProps) {
  const [applyStage, setApplyStage] = useState<'idle' | 'temporal' | 'confirmed'>('idle');

  const handleApplyClick = () => {
    const applyFlow = new FilterApplyFlow(onApplyFilters);
    applyFlow.applyAll();
    setApplyStage((prev) =>
      prev === 'idle' ? 'temporal' : prev === 'temporal' ? 'confirmed' : 'temporal'
    );
  };

  const handleResetClick = async () => {
    const resetFlow = new FilterResetFlow(onResetFilters);
    resetFlow.resetAll();
    if (onRefresh) await onRefresh();
    setApplyStage('idle');
  };

  const getApplyButtonColor = () => {
    switch (applyStage) {
      case 'temporal':
        return '#fbc02d'; // amarillo
      case 'confirmed':
        return '#00ff0a'; // verde
      default:
        return '#333'; // gris (fallback)
    }
  };

  return (
    <>
      <Tooltip title="Tocá 2 veces para aplicar filtros" disableInteractive arrow>
        <IconButton
          onClick={handleApplyClick}
          sx={{
            ...BUTTON_STYLES,
            ...sxButton,
            color: `${getApplyButtonColor()} !important`
          }}
        >
          <CheckIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reiniciar filtros y recargar" disableInteractive arrow>
        <IconButton
          onClick={handleResetClick}
          sx={{
            ...BUTTON_STYLES,
            ...sxButton,
            color: '#d32f2f !important'
          }}
        >
          <RefreshIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default memo(ApplyResetGroup);
