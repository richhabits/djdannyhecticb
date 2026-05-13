import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/utils/keyboard-shortcuts';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => {
      setIsOpen(true);
    };

    document.addEventListener('a11y:show-shortcuts', handleShowShortcuts);
    return () => {
      document.removeEventListener('a11y:show-shortcuts', handleShowShortcuts);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '?') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts help"
    >
      <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close keyboard shortcuts"
            className="p-2 hover:bg-zinc-800 rounded transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <X className="w-6 h-6 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(KEYBOARD_SHORTCUTS).map(([key, description]) => (
            <div key={key} className="flex gap-3 items-start">
              <kbd className="flex-shrink-0 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-white whitespace-nowrap h-fit">
                {key}
              </kbd>
              <span className="text-gray-300 text-sm flex-1 pt-0.5">{description}</span>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-700/50">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">Tip:</span> Press Alt+? anytime to open this help dialog.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
