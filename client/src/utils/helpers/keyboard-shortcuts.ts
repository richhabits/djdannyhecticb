/**
 * WCAG 2.1 AAA Keyboard Shortcuts
 * All shortcuts are fully documented and accessible
 */

export const KEYBOARD_SHORTCUTS = {
  'Alt+A': 'Open/close accessibility settings',
  'Alt+H': 'Go to home page',
  'Alt+S': 'Skip to main content',
  'Alt+C': 'Focus search',
  'Alt+?': 'Show keyboard shortcuts help',
  Escape: 'Close modals and dropdowns',
  Tab: 'Navigate forward through focusable elements',
  'Shift+Tab': 'Navigate backward through focusable elements',
  Enter: 'Activate buttons, submit forms, follow links',
  Space: 'Toggle checkboxes, activate buttons, scroll page',
  'Arrow Up': 'Navigate up in lists, menus, and dropdowns',
  'Arrow Down': 'Navigate down in lists, menus, and dropdowns',
  'Arrow Left': 'Navigate left in lists, menus, and sliders',
  'Arrow Right': 'Navigate right in lists, menus, and sliders',
  Home: 'Go to start of content or list',
  End: 'Go to end of content or list',
  'Ctrl+F': 'Open find/search on page',
} as const;

export type KeyboardShortcutKey = keyof typeof KEYBOARD_SHORTCUTS;

/**
 * Hook keyboard shortcut handlers
 */
export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt+A - Accessibility settings
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      const event = new CustomEvent('a11y:toggle-panel');
      document.dispatchEvent(event);
    }

    // Alt+H - Go home
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      window.location.href = '/';
    }

    // Alt+S - Skip to main content
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Alt+C - Focus search
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      const searchInput = document.querySelector(
        'input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Alt+? - Show shortcuts help
    if (e.altKey && e.key === '?') {
      e.preventDefault();
      const event = new CustomEvent('a11y:show-shortcuts');
      document.dispatchEvent(event);
    }
  });
}

/**
 * Get formatted keyboard shortcut help text
 */
export function getKeyboardShortcutHelp(): string {
  const shortcuts = Object.entries(KEYBOARD_SHORTCUTS)
    .map(([key, description]) => `${key}: ${description}`)
    .join('\n');

  return shortcuts;
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(key: string): string {
  // Replace platform-specific keys
  const shortcuts: { [key: string]: string } = {
    'Ctrl': 'Ctrl',
    'Shift': 'Shift',
    'Alt': 'Alt',
    'Meta': 'Cmd',
    'Cmd': 'Cmd',
    'Command': 'Cmd',
    '+': '+',
    ' ': 'Space',
    'Enter': 'Enter',
    'Return': 'Enter',
    'Escape': 'Esc',
    'Esc': 'Esc',
    'Tab': 'Tab',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  };

  return shortcuts[key] || key;
}

/**
 * Parse keyboard event to shortcut string
 */
export function getShortcutFromEvent(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push('Ctrl');
  if (event.shiftKey) parts.push('Shift');
  if (event.altKey) parts.push('Alt');
  if (event.metaKey && !event.ctrlKey) parts.push('Cmd');

  // Add the key (skip modifiers)
  if (
    event.key !== 'Control' &&
    event.key !== 'Shift' &&
    event.key !== 'Alt' &&
    event.key !== 'Meta'
  ) {
    parts.push(formatShortcutKey(event.key));
  }

  return parts.join('+');
}

/**
 * Check if a shortcut matches an event
 */
export function isShortcutMatch(
  event: KeyboardEvent,
  shortcutKey: KeyboardShortcutKey
): boolean {
  const eventShortcut = getShortcutFromEvent(event);
  return eventShortcut === shortcutKey;
}

/**
 * Create a keyboard shortcut help modal
 */
export function createKeyboardShortcutHelp(): HTMLElement {
  const container = document.createElement('div');
  container.role = 'dialog';
  container.setAttribute('aria-modal', 'true');
  container.setAttribute('aria-label', 'Keyboard shortcuts help');
  container.className =
    'fixed inset-0 bg-black/80 flex items-center justify-center z-50';

  const content = document.createElement('div');
  content.className = 'bg-zinc-900 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto';

  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold text-white mb-4';
  title.textContent = 'Keyboard Shortcuts';
  content.appendChild(title);

  const list = document.createElement('div');
  list.className = 'space-y-3';

  Object.entries(KEYBOARD_SHORTCUTS).forEach(([key, description]) => {
    const item = document.createElement('div');
    item.className = 'flex gap-4 items-start';

    const keyElement = document.createElement('kbd');
    keyElement.className =
      'flex-shrink-0 px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm font-mono text-white whitespace-nowrap';
    keyElement.textContent = key;

    const descElement = document.createElement('span');
    descElement.className = 'text-gray-300 text-sm flex-1';
    descElement.textContent = description;

    item.appendChild(keyElement);
    item.appendChild(descElement);
    list.appendChild(item);
  });

  content.appendChild(list);

  const closeButton = document.createElement('button');
  closeButton.className =
    'mt-6 px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors';
  closeButton.textContent = 'Close (Esc)';
  closeButton.addEventListener('click', () => {
    container.remove();
  });
  content.appendChild(closeButton);

  // Close on Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      container.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  container.appendChild(content);

  // Close on background click
  container.addEventListener('click', (e) => {
    if (e.target === container) {
      container.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return container;
}

/**
 * Initialize global keyboard shortcut listeners
 */
export function initializeKeyboardShortcuts() {
  setupKeyboardShortcuts();

  // Listen for custom events
  document.addEventListener('a11y:show-shortcuts', () => {
    const help = createKeyboardShortcutHelp();
    document.body.appendChild(help);
  });
}
