/**
 * Enhanced Theme Context
 * Manages light/dark/auto themes, high contrast, and color blindness modes
 * Persists preference to localStorage
 * Last updated: 2026-05-01
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

type ThemeType = 'light' | 'dark' | 'auto';
type ContrastMode = 'normal' | 'high';
type ColorMode =
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'monochromacy';

interface ThemeContextType {
  theme: ThemeType;
  contrast: ContrastMode;
  colorMode: ColorMode;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  setContrast: (contrast: ContrastMode) => void;
  setColorMode: (colorMode: ColorMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'djdanny-theme-preferences';
const THEME_KEY = 'theme';
const CONTRAST_KEY = 'contrast';
const COLOR_MODE_KEY = 'colorMode';

interface StoredPreferences {
  [THEME_KEY]?: ThemeType;
  [CONTRAST_KEY]?: ContrastMode;
  [COLOR_MODE_KEY]?: ColorMode;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [contrast, setContrastState] = useState<ContrastMode>('normal');
  const [colorMode, setColorModeState] = useState<ColorMode>('normal');
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const preferences: StoredPreferences = JSON.parse(stored);
        if (preferences[THEME_KEY]) {
          setThemeState(preferences[THEME_KEY]);
        }
        if (preferences[CONTRAST_KEY]) {
          setContrastState(preferences[CONTRAST_KEY]);
        }
        if (preferences[COLOR_MODE_KEY]) {
          setColorModeState(preferences[COLOR_MODE_KEY]);
        }
      } catch (e) {
        console.error('Failed to parse theme preferences:', e);
      }
    }
    setMounted(true);
  }, []);

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Update isDark based on theme
  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        .matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;

    const htmlElement = document.documentElement;

    // Set theme attribute
    htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Set contrast attribute
    htmlElement.setAttribute('data-contrast', contrast);

    // Set color mode attribute
    htmlElement.setAttribute('data-color-mode', colorMode);

    // Apply theme class for backward compatibility
    if (isDark) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  }, [isDark, contrast, colorMode, mounted]);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    const stored = localStorage.getItem(STORAGE_KEY);
    const preferences: StoredPreferences = stored ? JSON.parse(stored) : {};
    preferences[THEME_KEY] = newTheme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, []);

  const setContrast = useCallback((newContrast: ContrastMode) => {
    setContrastState(newContrast);
    const stored = localStorage.getItem(STORAGE_KEY);
    const preferences: StoredPreferences = stored ? JSON.parse(stored) : {};
    preferences[CONTRAST_KEY] = newContrast;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, []);

  const setColorMode = useCallback((newColorMode: ColorMode) => {
    setColorModeState(newColorMode);
    const stored = localStorage.getItem(STORAGE_KEY);
    const preferences: StoredPreferences = stored ? JSON.parse(stored) : {};
    preferences[COLOR_MODE_KEY] = newColorMode;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const value: ThemeContextType = {
    theme,
    contrast,
    colorMode,
    isDark,
    setTheme,
    setContrast,
    setColorMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook to detect if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to detect if user prefers more contrast
 */
export const usePrefersContrast = (): boolean => {
  const [prefersContrast, setPrefersContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setPrefersContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersContrast;
};

/**
 * Hook to detect if user has reduced data preference
 */
export const usePrefersReducedData = (): boolean => {
  const [prefersReducedData, setPrefersReducedData] = useState(false);

  useEffect(() => {
    // Note: prefers-reduced-data is not yet widely supported
    // This is a forward-looking implementation
    const mediaQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    setPrefersReducedData(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedData(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedData;
};
