import { createContext, useContext, useState, useEffect } from 'react';

const PortalThemeContext = createContext(null);

const STORAGE_KEY = 'portal-theme';
const DEFAULT_THEME = 'dark';

export function PortalThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <PortalThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </PortalThemeContext.Provider>
  );
}

const FALLBACK = { theme: 'dark', toggleTheme: () => {} };
export const usePortalTheme = () => useContext(PortalThemeContext) ?? FALLBACK;
