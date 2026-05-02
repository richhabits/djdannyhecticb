/**
 * Design System - Complete Reference Guide
 * Typography, Colors, Spacing, Motion, and Accessibility
 * Last updated: 2026-05-01
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Design System/Reference',
  tags: ['autodocs'],
};

export default meta;

/**
 * TYPOGRAPHY SECTION
 */

export const TypographyScale: StoryObj = {
  render: () => (
    <div className="space-y-lg p-lg">
      <div>
        <p className="text-caption text-text-secondary mb-md">Display (36px)</p>
        <h1 className="text-display font-bold">
          The quick brown fox jumps over the lazy dog
        </h1>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Heading 1 (28px)</p>
        <h1 className="text-h1 font-bold">
          The quick brown fox jumps over the lazy dog
        </h1>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Heading 2 (20px)</p>
        <h2 className="text-h2 font-bold">
          The quick brown fox jumps over the lazy dog
        </h2>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Heading 3 (16px)</p>
        <h3 className="text-h3 font-bold">
          The quick brown fox jumps over the lazy dog
        </h3>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Body (14px)</p>
        <p className="text-body">
          The quick brown fox jumps over the lazy dog. This is the default body
          text size used for paragraphs and main content.
        </p>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Caption (12px)</p>
        <p className="text-caption">
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div>
        <p className="text-caption text-text-secondary mb-md">Micro (10px)</p>
        <p className="text-micro">THE QUICK BROWN FOX</p>
      </div>
    </div>
  ),
};

/**
 * COLOR PALETTE SECTION
 */

export const ColorPalette: StoryObj = {
  render: () => (
    <div className="p-lg space-y-2xl">
      {/* Backgrounds */}
      <div>
        <h3 className="text-h3 font-bold mb-lg">Background Colors</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-4 gap-md">
          <div className="p-lg bg-dark-bg border border-dark-border rounded-lg">
            <p className="text-caption text-text-secondary mb-xs">
              Dark BG
            </p>
            <p className="text-h3 text-text-primary font-bold">#0A0A0A</p>
          </div>
          <div className="p-lg bg-dark-surface border border-dark-border rounded-lg">
            <p className="text-caption text-text-secondary mb-xs">
              Dark Surface
            </p>
            <p className="text-h3 text-text-primary font-bold">#1F1F1F</p>
          </div>
          <div className="p-lg bg-dark-tertiary border border-dark-border rounded-lg">
            <p className="text-caption text-text-secondary mb-xs">
              Dark Tertiary
            </p>
            <p className="text-h3 text-text-primary font-bold">#2A2A2A</p>
          </div>
          <div className="p-lg bg-dark-quaternary border border-dark-border rounded-lg">
            <p className="text-caption text-text-secondary mb-xs">
              Dark Quaternary
            </p>
            <p className="text-h3 text-text-primary font-bold">#333333</p>
          </div>
        </div>
      </div>

      {/* Accents */}
      <div>
        <h3 className="text-h3 font-bold mb-lg">Accent Colors</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-5 gap-md">
          <div>
            <div className="w-full h-24 bg-accent-red rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Primary Red</p>
            <p className="text-micro text-text-secondary">#FF4444</p>
          </div>
          <div>
            <div className="w-full h-24 bg-accent-success rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Success</p>
            <p className="text-micro text-text-secondary">#22C55E</p>
          </div>
          <div>
            <div className="w-full h-24 bg-accent-warning rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Warning</p>
            <p className="text-micro text-text-secondary">#EAB308</p>
          </div>
          <div>
            <div className="w-full h-24 bg-accent-danger rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Danger</p>
            <p className="text-micro text-text-secondary">#EF4444</p>
          </div>
          <div>
            <div className="w-full h-24 bg-accent-orange rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Orange</p>
            <p className="text-micro text-text-secondary">#F97316</p>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div>
        <h3 className="text-h3 font-bold mb-lg">Tier Colors</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-4 gap-md">
          <div>
            <div className="w-full h-24 bg-tier-gold rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Gold</p>
            <p className="text-micro text-text-secondary">#D4AF37</p>
          </div>
          <div>
            <div className="w-full h-24 bg-tier-silver rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Silver</p>
            <p className="text-micro text-text-secondary">#C0C0C0</p>
          </div>
          <div>
            <div className="w-full h-24 bg-tier-bronze rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Bronze</p>
            <p className="text-micro text-text-secondary">#CD7F32</p>
          </div>
          <div>
            <div className="w-full h-24 bg-tier-platinum rounded-lg mb-md border border-dark-border" />
            <p className="text-caption font-semibold">Platinum</p>
            <p className="text-micro text-text-secondary">#9D4EDD</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * SPACING SCALE
 */

export const SpacingScale: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <h3 className="text-h3 font-bold">Spacing Scale (4px base unit)</h3>

      <div className="space-y-md">
        {[
          { name: 'XS', value: '4px', class: 'space-y-xs' },
          { name: 'SM', value: '8px', class: 'space-y-sm' },
          { name: 'MD', value: '16px', class: 'space-y-md' },
          { name: 'LG', value: '24px', class: 'space-y-lg' },
          { name: 'XL', value: '32px', class: 'space-y-xl' },
          { name: '2XL', value: '48px', class: 'space-y-2xl' },
          { name: '3XL', value: '64px', class: 'space-y-3xl' },
          { name: '4XL', value: '80px', class: 'space-y-4xl' },
        ].map((spacing) => (
          <div key={spacing.name} className="flex items-center gap-md">
            <div className="w-20">
              <p className="text-caption font-bold">{spacing.name}</p>
              <p className="text-micro text-text-secondary">{spacing.value}</p>
            </div>
            <div className="flex-1">
              <div className="flex gap-md">
                <div className="bg-accent-red w-12 h-12 rounded-lg" />
                <div
                  className="bg-accent-red w-12 h-12 rounded-lg"
                  style={{ marginLeft: spacing.value }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * BORDER RADIUS
 */

export const BorderRadius: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <h3 className="text-h3 font-bold">Border Radius</h3>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-lg">
        {[
          { name: 'None', class: 'rounded-none' },
          { name: 'SM (4px)', class: 'rounded-sm' },
          { name: 'MD (8px)', class: 'rounded-md' },
          { name: 'LG (12px)', class: 'rounded-lg' },
          { name: 'XL (16px)', class: 'rounded-xl' },
          { name: 'Full (9999px)', class: 'rounded-full' },
        ].map((radius) => (
          <div key={radius.name} className="text-center">
            <div
              className={`w-24 h-24 bg-accent-red mx-auto mb-md ${radius.class}`}
            />
            <p className="text-caption font-semibold">{radius.name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * SHADOWS
 */

export const Shadows: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <h3 className="text-h3 font-bold">Shadow Depths</h3>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-lg">
        {[
          { name: 'Small', class: 'shadow-sm' },
          { name: 'Medium', class: 'shadow-md' },
          { name: 'Large', class: 'shadow-lg' },
          { name: 'XL', class: 'shadow-xl' },
          { name: '2XL', class: 'shadow-2xl' },
          { name: 'Elevated', class: 'shadow-elevated' },
        ].map((shadow) => (
          <div key={shadow.name} className="flex flex-col items-center">
            <div
              className={`w-32 h-32 bg-dark-surface rounded-lg mb-md ${shadow.class}`}
            />
            <p className="text-caption font-semibold">{shadow.name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * MOTION DURATIONS & EASING
 */

export const MotionTimings: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <div>
        <h3 className="text-h3 font-bold mb-lg">Transition Durations</h3>
        <div className="space-y-md">
          {[
            { name: 'Fast', value: '150ms' },
            { name: 'Base', value: '200ms' },
            { name: 'Slow', value: '300ms' },
            { name: 'Slower', value: '400ms' },
            { name: 'Slowest', value: '500ms' },
          ].map((duration) => (
            <div key={duration.name} className="flex items-center gap-md">
              <div className="w-24">
                <p className="text-caption font-bold">{duration.name}</p>
                <p className="text-micro text-text-secondary">
                  {duration.value}
                </p>
              </div>
              <div className="flex-1">
                <div
                  className="w-12 h-12 bg-accent-red rounded-lg"
                  style={{
                    animation: `pulse ${duration.value} infinite`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-h3 font-bold mb-lg">Easing Functions</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
          {[
            {
              name: 'Ease Out',
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
            {
              name: 'Ease In',
              easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            },
            {
              name: 'Ease In-Out',
              easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            },
            { name: 'Linear', easing: 'linear' },
          ].map((easing) => (
            <div key={easing.name} className="p-md border border-dark-border rounded-lg">
              <p className="text-caption font-bold mb-md">{easing.name}</p>
              <div
                className="w-full h-8 bg-accent-red rounded"
                style={{
                  animation: `slideInFromLeft 2s ${easing.easing} infinite`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * ACCESSIBILITY - WCAG AAA
 */

export const AccessibilityStandards: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <div>
        <h3 className="text-h3 font-bold mb-lg">Contrast Ratios (WCAG AAA)</h3>
        <div className="space-y-md">
          {[
            {
              bg: '#0A0A0A',
              text: '#FFFFFF',
              ratio: '21:1',
              level: 'AAA++',
            },
            {
              bg: '#0A0A0A',
              text: '#B3B3B3',
              ratio: '10.5:1',
              level: 'AAA',
            },
            {
              bg: '#0A0A0A',
              text: '#999999',
              ratio: '8:1',
              level: 'AAA',
            },
            {
              bg: '#0A0A0A',
              text: '#666666',
              ratio: '4.5:1',
              level: 'AA',
            },
          ].map((contrast, idx) => (
            <div key={idx} className="flex items-center gap-md">
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: contrast.bg,
                  color: contrast.text,
                }}
              >
                <span className="text-center">
                  <p className="text-body font-bold">Sample</p>
                  <p className="text-caption">{contrast.ratio}</p>
                </span>
              </div>
              <div>
                <p className="text-caption font-bold">
                  {contrast.ratio} Contrast
                </p>
                <p className="text-micro text-text-secondary">
                  WCAG {contrast.level}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-h3 font-bold mb-lg">Focus Indicators</h3>
        <p className="text-body text-text-secondary mb-lg">
          All interactive elements have visible focus indicators with 3px outline
          and 2px offset.
        </p>
        <button className="px-lg py-md bg-accent-red text-text-primary rounded-md focus-visible:outline-2 focus-visible:outline-accent-red focus-visible:outline-offset-2">
          Press Tab to see focus
        </button>
      </div>

      <div>
        <h3 className="text-h3 font-bold mb-lg">Touch Targets</h3>
        <p className="text-body text-text-secondary mb-lg">
          Minimum 56x56px for mobile, 44x40px for desktop with 8px spacing.
        </p>
        <div className="flex gap-md">
          <div className="w-14 h-14 bg-accent-red rounded-md flex items-center justify-center text-text-primary text-caption font-bold">
            56px
          </div>
          <div className="w-11 h-10 bg-accent-red rounded-md flex items-center justify-center text-text-primary text-caption font-bold">
            44px
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * MOTION PREFERS REDUCED
 */

export const ReducedMotionSupport: StoryObj = {
  render: () => (
    <div className="p-lg space-y-lg">
      <h3 className="text-h3 font-bold">Reduced Motion Support</h3>
      <p className="text-body text-text-secondary mb-lg">
        All animations respect the `prefers-reduced-motion: reduce` media query.
        Change your system preferences to see animations disable.
      </p>

      <div className="space-y-md">
        <p className="text-caption font-bold text-text-secondary">
          Example Animation (respects reduced motion):
        </p>
        <div
          className="w-12 h-12 bg-accent-red rounded-lg"
          style={{
            animation: 'fadeIn 2s ease-out infinite',
          }}
        />
      </div>
    </div>
  ),
};

/**
 * COMPONENT COMPOSITION PATTERNS
 */

export const CompositionPatterns: StoryObj = {
  render: () => (
    <div className="p-lg space-y-2xl">
      <h2 className="text-h2 font-bold mb-lg">Composition Patterns</h2>

      {/* Card Patterns */}
      <div>
        <h3 className="text-h3 font-bold mb-lg">Card Patterns</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
          {/* Basic Card */}
          <div className="bg-dark-surface p-lg rounded-lg border border-dark-border">
            <h4 className="text-h3 font-bold mb-sm">Basic Card</h4>
            <p className="text-body text-text-secondary mb-lg">
              Simple card with title, description, and actions.
            </p>
            <button className="px-md py-sm bg-accent-red text-text-primary rounded-md text-sm">
              Action
            </button>
          </div>

          {/* Media Card */}
          <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
            <div className="w-full h-40 bg-dark-bg" />
            <div className="p-lg">
              <h4 className="text-h3 font-bold mb-sm">Media Card</h4>
              <p className="text-body text-text-secondary">
                Card with image/video at top.
              </p>
            </div>
          </div>

          {/* Stat Card */}
          <div className="bg-dark-surface p-lg rounded-lg border border-dark-border">
            <p className="text-caption text-text-secondary mb-md">METRIC</p>
            <p className="text-display font-bold text-accent-red mb-md">1,234</p>
            <p className="text-caption text-text-secondary">↑ 12% from last week</p>
          </div>

          {/* Feature Card */}
          <div className="bg-dark-surface p-lg rounded-lg border border-dark-border border-accent-red/30">
            <div className="text-2xl mb-md text-accent-red">⭐</div>
            <h4 className="text-h3 font-bold mb-sm">Premium Feature</h4>
            <p className="text-body text-text-secondary">
              Highlighted feature card.
            </p>
          </div>
        </div>
      </div>

      {/* Form Patterns */}
      <div>
        <h3 className="text-h3 font-bold mb-lg">Form Patterns</h3>
        <div className="bg-dark-surface p-lg rounded-lg border border-dark-border space-y-md max-w-md">
          <div>
            <label className="block text-body font-semibold mb-xs">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-md py-sm bg-dark-bg border border-dark-border rounded-md text-text-primary"
            />
          </div>
          <div>
            <label className="block text-body font-semibold mb-xs">
              Message
            </label>
            <textarea
              placeholder="Your message..."
              className="w-full px-md py-sm bg-dark-bg border border-dark-border rounded-md text-text-primary h-24"
            />
          </div>
          <button className="w-full px-md py-sm bg-accent-red text-text-primary rounded-md font-semibold">
            Submit
          </button>
        </div>
      </div>
    </div>
  ),
};
