'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingOverlay({ loadingText }: { loadingText?: string }) {
  const BRAND = '#127CF3'; // Synara primary blue
  const LIGHT = {
    text: 'oklch(0.2 0.04 240)',
    bg: 'rgba(255,255,255,0.9)',
  };
  const DARK = {
    text: 'oklch(0.98 0.002 240)',
    bg: 'rgba(0,0,0,0.45)',
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
    <Box
      sx={{
        textAlign: 'center',
        p: '32px',
        color: C.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        backgroundColor: C.bg,
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
      }}
    >
      <CircularProgress sx={{ color: BRAND, mb: 1 }} size={22} />
      <Typography variant="body2">{loadingText}</Typography>
    </Box>
  );
}
