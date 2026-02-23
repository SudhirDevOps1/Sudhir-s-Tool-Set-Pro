import { useState, useEffect, useCallback } from 'react';

export type ThemeName = 'default' | 'cyber' | 'neon';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('sudhir-theme');
    return (saved as ThemeName) || 'default';
  });

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('sudhir-theme', t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const themes: ThemeName[] = ['default', 'cyber', 'neon'];
    const current = document.documentElement.getAttribute('data-theme') || 'default';
    const next = themes[(themes.indexOf(current as ThemeName) + 1) % themes.length];
    setTheme(next);
    return next;
  }, [setTheme]);

  return { theme, setTheme, cycleTheme };
}
