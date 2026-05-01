import { useAccessibilityEnhancements } from '@/hooks/useAccessibilityEnhancements';
import { CaptionedContent } from './CaptionedContent';

/**
 * Accessibility Feature Demo Component
 * Demonstrates all WCAG 2.1 AAA features
 */
export function AccessibilityDemo() {
  const { preferences } = useAccessibilityEnhancements();

  return (
    <div className="space-y-12 p-6 max-w-4xl mx-auto">
      <section role="region" aria-labelledby="intro-heading">
        <h1 id="intro-heading" className="text-3xl font-bold text-white mb-4">
          WCAG 2.1 AAA Accessibility Features
        </h1>
        <p className="text-gray-300 mb-4">
          This page demonstrates all advanced accessibility features implemented in Ghost Detail.
        </p>

        {/* Current Settings Display */}
        <div
          className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/50"
          role="status"
          aria-live="polite"
        >
          <p className="text-blue-200 font-semibold mb-2">Current Settings:</p>
          <ul className="text-blue-100 text-sm space-y-1 ml-4">
            <li>
              High Contrast:{' '}
              <span className="font-mono text-blue-300">
                {preferences.highContrast ? 'ON' : 'OFF'}
              </span>
            </li>
            <li>
              Large Text:{' '}
              <span className="font-mono text-blue-300">
                {preferences.largeText ? 'ON' : 'OFF'}
              </span>
            </li>
            <li>
              Text Spacing:{' '}
              <span className="font-mono text-blue-300">
                {preferences.textSpacing ? 'ON' : 'OFF'}
              </span>
            </li>
            <li>
              Colorblind Mode:{' '}
              <span className="font-mono text-blue-300">
                {preferences.colorblindMode === 'none'
                  ? 'OFF'
                  : preferences.colorblindMode.toUpperCase()}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Skip Link Demo */}
      <section role="region" aria-labelledby="skip-heading">
        <h2 id="skip-heading" className="text-2xl font-bold text-white mb-4">
          Skip Links
        </h2>
        <div className="space-y-2 text-gray-300">
          <p>
            Press <kbd className="bg-zinc-700 px-2 py-1 rounded text-white">Tab</kbd> at the top of
            the page to reveal the skip link. This allows keyboard users to bypass navigation.
          </p>
          <a href="#main-content" className="sr-skip-link">
            Skip to main content
          </a>
        </div>
      </section>

      {/* Focus Management Demo */}
      <section role="region" aria-labelledby="focus-heading">
        <h2 id="focus-heading" className="text-2xl font-bold text-white mb-4">
          Enhanced Focus Indicators
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            All interactive elements have clear, 3px focus outlines visible in {' '}
            <strong>all</strong> viewing modes, including high contrast.
          </p>

          <div className="flex gap-4 flex-wrap">
            <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
              Button
            </button>
            <a href="#" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
              Link
            </a>
            <input
              type="text"
              placeholder="Input field"
              className="px-4 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus-visible:border-red-500"
            />
          </div>

          <p className="text-xs text-gray-400">
            Click or tab through elements to see the red focus outline
          </p>
        </div>
      </section>

      {/* Touch Target Demo */}
      <section role="region" aria-labelledby="touch-heading">
        <h2 id="touch-heading" className="text-2xl font-bold text-white mb-4">
          Minimum Touch Targets (48x48px)
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            All interactive elements meet the AAA requirement of 48×48 pixels minimum size.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <button
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded hover:bg-zinc-700"
              aria-label="Demo button 1"
            >
              48×48px
            </button>
            <button
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded hover:bg-zinc-700"
              aria-label="Demo button 2"
            >
              Minimum
            </button>
            <button
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded hover:bg-zinc-700"
              aria-label="Demo button 3"
            >
              Size
            </button>
          </div>
        </div>
      </section>

      {/* Contrast Ratio Demo */}
      <section role="region" aria-labelledby="contrast-heading">
        <h2 id="contrast-heading" className="text-2xl font-bold text-white mb-4">
          7:1 Contrast Ratio (AAA)
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            All text achieves at least 7:1 contrast ratio as required by WCAG 2.1 Level AAA.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black rounded">
              <p className="text-white font-semibold">Black background</p>
              <p className="text-gray-300 text-sm">White text: 21:1 contrast</p>
            </div>

            <div className="p-4 bg-zinc-900 rounded border border-zinc-700">
              <p className="text-white font-semibold">Dark background</p>
              <p className="text-gray-300 text-sm">Light gray text: 8.5:1 contrast</p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Use the{' '}
            <a href="https://webaim.org/resources/contrastchecker/" className="text-red-500 underline">
              WebAIM Contrast Checker
            </a>{' '}
            to verify colors
          </p>
        </div>
      </section>

      {/* Keyboard Navigation Demo */}
      <section role="region" aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading" className="text-2xl font-bold text-white mb-4">
          Keyboard Navigation
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Every feature is fully accessible via keyboard. Try these:
          </p>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <kbd className="bg-zinc-800 px-3 py-1 rounded text-white font-mono whitespace-nowrap">
                  Tab
                </kbd>
                <span className="text-gray-300">Navigate forward</span>
              </div>
              <div className="flex gap-4">
                <kbd className="bg-zinc-800 px-3 py-1 rounded text-white font-mono whitespace-nowrap">
                  Shift+Tab
                </kbd>
                <span className="text-gray-300">Navigate backward</span>
              </div>
              <div className="flex gap-4">
                <kbd className="bg-zinc-800 px-3 py-1 rounded text-white font-mono whitespace-nowrap">
                  Enter
                </kbd>
                <span className="text-gray-300">Activate buttons</span>
              </div>
              <div className="flex gap-4">
                <kbd className="bg-zinc-800 px-3 py-1 rounded text-white font-mono whitespace-nowrap">
                  Space
                </kbd>
                <span className="text-gray-300">Toggle checkboxes</span>
              </div>
              <div className="flex gap-4">
                <kbd className="bg-zinc-800 px-3 py-1 rounded text-white font-mono whitespace-nowrap">
                  Alt+?
                </kbd>
                <span className="text-gray-300">Show all shortcuts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Indicators Demo */}
      <section role="region" aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-2xl font-bold text-white mb-4">
          Colorblind-Safe Status Indicators
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Status colors are chosen to be distinguishable for people with color vision deficiency.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Standard Colors:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600" aria-hidden="true" />
                  <span className="text-gray-300 text-sm">Error/Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-600" aria-hidden="true" />
                  <span className="text-gray-300 text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-600" aria-hidden="true" />
                  <span className="text-gray-300 text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600" aria-hidden="true" />
                  <span className="text-gray-300 text-sm">Info</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Colorblind-Safe (Active Mode):</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: 'var(--color-status-error, #FF4444)' }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-300 text-sm">Error/Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: 'var(--color-status-success, #22C55E)' }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-300 text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: 'var(--color-status-warning, #EAB308)' }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-300 text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: 'var(--color-status-info, #3B82F6)' }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-300 text-sm">Info</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Current mode: {preferences.colorblindMode === 'none' ? 'Standard colors' : preferences.colorblindMode}
          </p>
        </div>
      </section>

      {/* Video with Captions Demo */}
      <section role="region" aria-labelledby="video-heading">
        <h2 id="video-heading" className="text-2xl font-bold text-white mb-4">
          Captions & Transcripts
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            All video content includes captions and transcripts for accessibility.
          </p>

          <CaptionedContent
            videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
            transcriptText={`This is a sample transcript.

All video content should include:
- Captions for dialogue and audio cues
- Audio descriptions for visual content
- Full transcript for reference

This ensures accessibility for:
- Deaf and hard of hearing users
- Users in noisy environments
- Users who prefer reading
- Users learning a language`}
            title="Sample Accessible Video"
            description="This video demonstrates caption and transcript support"
          />
        </div>
      </section>

      {/* Form Accessibility Demo */}
      <section role="region" aria-labelledby="form-heading">
        <h2 id="form-heading" className="text-2xl font-bold text-white mb-4">
          Accessible Form Example
        </h2>
        <form className="space-y-4 max-w-md">
          <div>
            <label htmlFor="demo-name" className="block text-sm font-semibold text-white mb-2">
              Name <span aria-label="required">*</span>
            </label>
            <input
              id="demo-name"
              type="text"
              required
              aria-describedby="name-help"
              className="w-full px-4 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus-visible:border-red-500"
              placeholder="Enter your name"
            />
            <p id="name-help" className="text-xs text-gray-400 mt-1">
              Your full name as it appears on documents
            </p>
          </div>

          <div>
            <label htmlFor="demo-email" className="block text-sm font-semibold text-white mb-2">
              Email <span aria-label="required">*</span>
            </label>
            <input
              id="demo-email"
              type="email"
              required
              aria-describedby="email-help"
              className="w-full px-4 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus-visible:border-red-500"
              placeholder="you@example.com"
            />
            <p id="email-help" className="text-xs text-gray-400 mt-1">
              We'll never share your email
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded accent-red-600"
                aria-describedby="terms-help"
              />
              <span className="text-sm text-gray-300">I agree to the terms</span>
            </label>
            <p id="terms-help" className="text-xs text-gray-400 mt-1 ml-8">
              Read our full terms and conditions before checking
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
          >
            Submit Form
          </button>
        </form>
      </section>

      {/* Testing Tips */}
      <section
        role="region"
        aria-labelledby="testing-heading"
        className="p-6 rounded-lg bg-green-900/20 border border-green-700/50"
      >
        <h2 id="testing-heading" className="text-lg font-bold text-green-300 mb-4">
          How to Test These Features
        </h2>
        <ul className="text-green-100 text-sm space-y-2 ml-4 list-disc">
          <li>
            <strong>Keyboard Navigation:</strong> Press Tab and Shift+Tab to navigate
          </li>
          <li>
            <strong>Screen Reader:</strong> Download and test with NVDA (free)
          </li>
          <li>
            <strong>Contrast:</strong> Use WebAIM Color Contrast Checker
          </li>
          <li>
            <strong>Automated Testing:</strong> Install axe DevTools browser extension
          </li>
          <li>
            <strong>Color Vision:</strong> Use a colorblindness simulator online
          </li>
          <li>
            <strong>Zoom:</strong> Press Ctrl+Plus to zoom the page
          </li>
          <li>
            <strong>High Contrast:</strong> Enable in your operating system settings
          </li>
        </ul>
      </section>
    </div>
  );
}
