import { useEffect, useState } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  colorblindMode: 'deuteranopia' | 'protanopia' | 'tritanopia' | 'none';
  focusIndicator: 'default' | 'enhanced';
  textSpacing: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  reduceMotion: false,
  largeText: false,
  colorblindMode: 'none',
  focusIndicator: 'default',
  textSpacing: false,
};

const A11Y_STORAGE_KEY = 'a11y-prefs';

export function useAccessibilityEnhancements() {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Detect system preferences on mount
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedTransparencyQuery = window.matchMedia(
      '(prefers-reduced-transparency: reduce)'
    );

    const updatePrefs = () => {
      setPrefs((prev) => ({
        ...prev,
        highContrast: highContrastQuery.matches,
        reduceMotion: reduceMotionQuery.matches,
      }));
    };

    // Initialize with system preferences
    updatePrefs();

    // Load saved preferences from localStorage
    const saved = localStorage.getItem(A11Y_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AccessibilityPreferences>;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        // Invalid JSON, ignore and use system prefs
        console.warn('Failed to parse accessibility preferences:', e);
      }
    }

    // Set up listeners for system preference changes
    highContrastQuery.addEventListener('change', updatePrefs);
    reduceMotionQuery.addEventListener('change', updatePrefs);
    reducedTransparencyQuery.addEventListener('change', updatePrefs);

    setIsLoaded(true);

    return () => {
      highContrastQuery.removeEventListener('change', updatePrefs);
      reduceMotionQuery.removeEventListener('change', updatePrefs);
      reducedTransparencyQuery.removeEventListener('change', updatePrefs);
    };
  }, []);

  // Apply preferences to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // High contrast mode
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text mode
    if (prefs.largeText) {
      root.classList.add('large-text');
      root.style.fontSize = '18px';
    } else {
      root.classList.remove('large-text');
      root.style.fontSize = '16px';
    }

    // Text spacing mode
    if (prefs.textSpacing) {
      root.classList.add('text-spacing-enhanced');
    } else {
      root.classList.remove('text-spacing-enhanced');
    }

    // Colorblind mode
    // Remove all colorblind classes first
    root.classList.forEach((className) => {
      if (className.startsWith('colorblind-')) {
        root.classList.remove(className);
      }
    });

    // Add new colorblind class if active
    if (prefs.colorblindMode !== 'none') {
      root.classList.add(`colorblind-${prefs.colorblindMode}`);
    }

    // Enhanced focus indicators
    if (prefs.focusIndicator === 'enhanced') {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Announce changes to screen readers
    announcePreferenceChange(prefs);
  }, [prefs, isLoaded]);

  const updatePreferences = (newPrefs: Partial<AccessibilityPreferences>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      // Persist to localStorage
      try {
        localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save accessibility preferences:', e);
      }
      return updated;
    });
  };

  const resetToDefaults = () => {
    updatePreferences(DEFAULT_PREFERENCES);
  };

  const resetToSystemPreferences = () => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    updatePreferences({
      highContrast: highContrastQuery.matches,
      reduceMotion: reduceMotionQuery.matches,
      largeText: false,
      colorblindMode: 'none',
      focusIndicator: 'default',
      textSpacing: false,
    });
  };

  return {
    preferences: prefs,
    updatePreferences,
    resetToDefaults,
    resetToSystemPreferences,
    isLoaded,
  };
}

// Announce accessibility preference changes to screen readers
function announcePreferenceChange(prefs: AccessibilityPreferences) {
  const announcements: string[] = [];

  if (prefs.highContrast) announcements.push('High contrast mode enabled');
  if (prefs.largeText) announcements.push('Large text mode enabled');
  if (prefs.textSpacing) announcements.push('Increased text spacing enabled');
  if (prefs.colorblindMode !== 'none')
    announcements.push(`${prefs.colorblindMode} colorblind mode enabled`);

  if (announcements.length === 0) {
    announcements.push('Accessibility settings reset to defaults');
  }

  // Create live region announcement
  const liveRegion = document.getElementById('a11y-announcements');
  if (liveRegion) {
    liveRegion.textContent = announcements.join('. ');
  }
}
