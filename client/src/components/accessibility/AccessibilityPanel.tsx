import { useState } from 'react';
import { useAccessibilityEnhancements } from '@/hooks/useAccessibilityEnhancements';
import { Settings, X } from 'lucide-react';

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreferences, resetToDefaults } = useAccessibilityEnhancements();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Alt+A to open/close
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Live region for announcements */}
      <div
        id="a11y-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        aria-label="Open accessibility settings (Alt+A)"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-red-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center focus-visible:outline-3 focus-visible:outline-red-400"
        title="Accessibility Settings (Alt+A)"
      >
        <Settings className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Panel Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur z-40"
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-700 shadow-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Accessibility Settings"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-4 bg-black border-b border-zinc-700">
            <h2 className="text-lg font-bold text-white">Accessibility</h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
              className="p-2 hover:bg-zinc-800 rounded transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Settings */}
          <div className="p-6 space-y-6">
            {/* High Contrast */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.highContrast}
                  onChange={(e) =>
                    updatePreferences({ highContrast: e.target.checked })
                  }
                  aria-describedby="high-contrast-desc"
                  className="w-5 h-5 rounded cursor-pointer accent-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
                />
                <span className="font-semibold text-white">High Contrast Mode</span>
              </label>
              <p id="high-contrast-desc" className="text-xs text-gray-400 ml-8">
                Increase contrast for better readability. Ensures 7:1 contrast ratio.
              </p>
            </div>

            {/* Large Text */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.largeText}
                  onChange={(e) =>
                    updatePreferences({ largeText: e.target.checked })
                  }
                  aria-describedby="large-text-desc"
                  className="w-5 h-5 rounded cursor-pointer accent-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
                />
                <span className="font-semibold text-white">Large Text (125%)</span>
              </label>
              <p id="large-text-desc" className="text-xs text-gray-400 ml-8">
                Increase font size across the entire site
              </p>
            </div>

            {/* Text Spacing */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.textSpacing}
                  onChange={(e) =>
                    updatePreferences({ textSpacing: e.target.checked })
                  }
                  aria-describedby="text-spacing-desc"
                  className="w-5 h-5 rounded cursor-pointer accent-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
                />
                <span className="font-semibold text-white">Increase Text Spacing</span>
              </label>
              <p id="text-spacing-desc" className="text-xs text-gray-400 ml-8">
                Better for dyslexia and improved readability
              </p>
            </div>

            {/* Colorblind Modes */}
            <div className="space-y-2">
              <label htmlFor="colorblind-select" className="block font-semibold text-white">
                Colorblind Mode
              </label>
              <select
                id="colorblind-select"
                value={preferences.colorblindMode}
                onChange={(e) =>
                  updatePreferences({
                    colorblindMode: e.target.value as any,
                  })
                }
                aria-describedby="colorblind-desc"
                className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-600 text-white text-sm focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:border-red-500"
              >
                <option value="none">None</option>
                <option value="deuteranopia">Red-Green Blindness (Deuteranopia)</option>
                <option value="protanopia">Red-Blind (Protanopia)</option>
                <option value="tritanopia">Blue-Yellow Blindness (Tritanopia)</option>
              </select>
              <p id="colorblind-desc" className="text-xs text-gray-400">
                Adjust colors for colorblind accessibility using WCAG approved palettes
              </p>
            </div>

            {/* Focus Indicator */}
            <div className="space-y-2">
              <label htmlFor="focus-select" className="block font-semibold text-white">
                Focus Indicators
              </label>
              <select
                id="focus-select"
                value={preferences.focusIndicator}
                onChange={(e) =>
                  updatePreferences({
                    focusIndicator: e.target.value as any,
                  })
                }
                aria-describedby="focus-desc"
                className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-600 text-white text-sm focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:border-red-500"
              >
                <option value="default">Default</option>
                <option value="enhanced">Enhanced (Dashed)</option>
              </select>
              <p id="focus-desc" className="text-xs text-gray-400">
                Choose how focus indicators appear during keyboard navigation
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-700" />

            {/* Reset Button */}
            <button
              onClick={resetToDefaults}
              aria-label="Reset all accessibility settings to defaults"
              className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-600 hover:border-red-500 hover:bg-zinc-700 transition-colors text-sm font-semibold focus-visible:outline-2 focus-visible:outline-red-500"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-700 bg-black sticky bottom-0">
            <p className="text-xs text-gray-400">
              Settings are saved locally to your browser and will persist across sessions.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Keyboard shortcut: Alt+A to toggle this panel
            </p>
          </div>
        </div>
      )}
    </>
  );
}
