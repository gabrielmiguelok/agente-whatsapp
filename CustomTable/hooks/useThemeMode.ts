import { useState } from 'react';

export function useThemeMode(initialMode: 'light' | 'dark' = 'light') {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialMode);
  const toggleThemeMode = () =>
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const isDarkMode = themeMode === 'dark';
  return { themeMode, isDarkMode, toggleThemeMode };
}
