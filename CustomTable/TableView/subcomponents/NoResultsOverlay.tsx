'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function NoResultsOverlay({ noResultsText }: { noResultsText?: string }) {
  const BRAND = '#127CF3'; // Synara primary blue
  const LIGHT = {
    text: 'oklch(0.2 0.04 240)',
    bg: 'oklch(1 0 0)',
  };
  const DARK = {
    text: 'oklch(0.98 0.002 240)',
    bg: 'oklch(0.12 0.01 240)',
  };

  const getIsDark = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(getIsDark());
    const mql = window.matchMedia?.('(pers-color-scheme: dark)'.replace('pers', 'pref'));
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
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
        {noResultsText}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
        Modifica los filtros o la búsqueda para ver más resultados.
      </Typography>

      <div style={{ marginTop: 16, width: 36, height: 3, borderRadius: 2, background: BRAND, opacity: 0.5 }} />
    </Box>
  );
}
