import { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Overview',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Core design system foundations for djdannyhecticb platform. All components are built on these design tokens.',
      },
    },
  },
};

export default meta;

// Color Palette Story
export const ColorPalette = {
  render: () => {
    const colors = {
      Primary: [
        { name: 'Background', hex: '#0A0A0A', token: 'dark-bg' },
        { name: 'Surface', hex: '#1F1F1F', token: 'dark-surface' },
        { name: 'Border', hex: '#333333', token: 'dark-border' },
      ],
      Text: [
        { name: 'Primary', hex: '#FFFFFF', token: 'text-primary' },
        { name: 'Secondary', hex: '#999999', token: 'text-secondary' },
        { name: 'Tertiary', hex: '#666666', token: 'text-tertiary' },
      ],
      Accent: [
        { name: 'Red', hex: '#FF4444', token: 'accent-red' },
        { name: 'Red Hover', hex: '#FF5555', token: 'accent-red-hover' },
        { name: 'Red Dark', hex: '#CC3333', token: 'accent-red-dark' },
        { name: 'Success', hex: '#22C55E', token: 'accent-success' },
        { name: 'Warning', hex: '#EAB308', token: 'accent-warning' },
        { name: 'Danger', hex: '#EF4444', token: 'accent-danger' },
      ],
      Tier: [
        { name: 'Gold', hex: '#D4AF37', token: 'tier-gold' },
        { name: 'Silver', hex: '#C0C0C0', token: 'tier-silver' },
        { name: 'Bronze', hex: '#CD7F32', token: 'tier-bronze' },
        { name: 'Platinum', hex: '#9D4EDD', token: 'tier-platinum' },
      ],
    };

    return (
      <div className="space-y-2xl">
        {Object.entries(colors).map(([category, colorList]) => (
          <div key={category}>
            <h3 className="text-h2 font-bold mb-lg">{category} Colors</h3>
            <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-md">
              {colorList.map((color) => (
                <div key={color.hex} className="space-y-sm">
                  <div
                    className="w-full h-32 rounded-lg border border-dark-border shadow-md"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="font-semibold text-body">{color.name}</p>
                    <p className="text-caption text-text-secondary">
                      {color.hex}
                    </p>
                    <p className="text-micro text-text-tertiary font-mono">
                      {color.token}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-2xl pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Contrast Examples</h3>
          <div className="space-y-md">
            <div className="bg-dark-bg p-lg rounded-lg space-y-sm">
              <p className="text-text-primary text-body">
                ✅ White on Black (21:1) - Perfect contrast
              </p>
              <p className="text-text-secondary text-body">
                ✅ Gray on Black (7:1) - AAA accessible
              </p>
              <p className="text-text-tertiary text-body">
                ✅ Dark Gray on Black (4.48:1) - AA accessible
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Typography Story
export const Typography = {
  render: () => {
    const sizes = [
      { name: 'Display', class: 'text-display', size: '36px', weight: '700' },
      { name: 'H1', class: 'text-h1', size: '28px', weight: '700' },
      { name: 'H2', class: 'text-h2', size: '20px', weight: '700' },
      { name: 'H3', class: 'text-h3', size: '16px', weight: '600' },
      { name: 'Body', class: 'text-body', size: '14px', weight: '400' },
      { name: 'Caption', class: 'text-caption', size: '12px', weight: '400' },
      { name: 'Micro', class: 'text-micro', size: '10px', weight: '400' },
    ];

    return (
      <div className="space-y-2xl">
        <div>
          <h2 className="text-h2 font-bold mb-lg">Typography Scale</h2>
          <div className="space-y-lg">
            {sizes.map((type) => (
              <div key={type.name} className="space-y-sm">
                <div className={type.class}>
                  {type.name} - The quick brown fox jumps over lazy dog
                </div>
                <div className="flex gap-md text-caption text-text-secondary">
                  <span>{type.size}</span>
                  <span>Weight: {type.weight}</span>
                  <span className="font-mono">class: {type.class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Font Families</h3>
          <div className="space-y-md">
            <div className="font-system p-md bg-dark-surface rounded-lg">
              <p className="text-caption text-text-secondary mb-sm">
                System Font (Default)
              </p>
              <p className="text-body">
                -apple-system, BlinkMacSystemFont, Segoe UI, Roboto...
              </p>
            </div>
            <div className="font-inter p-md bg-dark-surface rounded-lg">
              <p className="text-caption text-text-secondary mb-sm">
                Inter Font
              </p>
              <p className="text-body">Specific feature implementations</p>
            </div>
            <div className="font-outfit p-md bg-dark-surface rounded-lg">
              <p className="text-caption text-text-secondary mb-sm">
                Outfit Font
              </p>
              <p className="text-body">Special typography treatments</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Spacing Story
export const Spacing = {
  render: () => {
    const spacingScale = [
      { token: 'xs', value: '4px' },
      { token: 'sm', value: '8px' },
      { token: 'md', value: '16px' },
      { token: 'lg', value: '24px' },
      { token: 'xl', value: '32px' },
      { token: '2xl', value: '48px' },
      { token: '3xl', value: '64px' },
      { token: '4xl', value: '80px' },
    ];

    return (
      <div className="space-y-2xl">
        <div>
          <h2 className="text-h2 font-bold mb-lg">Spacing Scale</h2>
          <div className="space-y-md">
            {spacingScale.map((spacing) => (
              <div key={spacing.token} className="space-y-sm">
                <div className="flex items-center gap-lg">
                  <div
                    className="bg-accent-red rounded"
                    style={{ width: spacing.value, height: '24px' }}
                  />
                  <div>
                    <p className="font-semibold">{spacing.token}</p>
                    <p className="text-caption text-text-secondary">
                      {spacing.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Usage Examples</h3>
          <div className="space-y-md">
            <div className="p-md bg-dark-surface rounded-lg border border-dark-border">
              <p className="text-caption text-text-secondary mb-sm">
                Padding (p-md)
              </p>
              <p className="text-body">16px padding on all sides</p>
            </div>
            <div className="space-y-md">
              <p className="text-caption text-text-secondary">
                Gap (space-y-md)
              </p>
              <div className="bg-dark-surface p-md rounded-lg">Item 1</div>
              <div className="bg-dark-surface p-md rounded-lg">Item 2</div>
              <div className="bg-dark-surface p-md rounded-lg">Item 3</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Border Radius Story
export const BorderRadius = {
  render: () => {
    const radiuses = [
      { token: 'none', value: '0px' },
      { token: 'sm', value: '4px' },
      { token: 'md', value: '8px' },
      { token: 'lg', value: '12px' },
      { token: 'xl', value: '16px' },
      { token: 'full', value: '9999px' },
    ];

    return (
      <div className="space-y-lg">
        <h2 className="text-h2 font-bold">Border Radius Scale</h2>
        <div className="grid grid-cols-2 tablet:grid-cols-3 gap-lg">
          {radiuses.map((radius) => (
            <div key={radius.token} className="space-y-md">
              <div
                className="w-full h-24 bg-accent-red border border-dark-border"
                style={{ borderRadius: radius.value }}
              />
              <div>
                <p className="font-semibold">{radius.token}</p>
                <p className="text-caption text-text-secondary">
                  {radius.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Shadows Story
export const Shadows = {
  render: () => {
    const shadows = [
      { token: 'sm', description: 'Subtle depth for small elements' },
      { token: 'md', description: 'Standard elevation for cards' },
      { token: 'lg', description: 'Elevated elements, dropdowns' },
      { token: 'xl', description: 'Modals, important overlays' },
      { token: '2xl', description: 'Maximum elevation' },
      { token: 'elevated', description: 'Critical modals' },
    ];

    return (
      <div className="space-y-lg">
        <h2 className="text-h2 font-bold">Shadow Scale</h2>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
          {shadows.map((shadow) => (
            <div key={shadow.token} className="space-y-md">
              <div
                className={`h-32 bg-dark-surface rounded-lg shadow-${shadow.token}`}
              />
              <div>
                <p className="font-semibold">shadow-{shadow.token}</p>
                <p className="text-caption text-text-secondary">
                  {shadow.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Animations Story
export const Animations = {
  render: () => {
    const animations = [
      'fade-in',
      'slide-in-top',
      'slide-in-bottom',
      'slide-in-left',
      'slide-in-right',
      'scale-in',
      'spin',
      'pulse-soft',
    ];

    return (
      <div className="space-y-2xl">
        <div>
          <h2 className="text-h2 font-bold mb-lg">Entrance Animations</h2>
          <div className="grid grid-cols-2 tablet:grid-cols-3 gap-lg">
            {animations.map((anim) => (
              <div key={anim} className="space-y-md">
                <div
                  className={`animate-${anim} h-24 bg-accent-red rounded-lg flex items-center justify-center`}
                >
                  <span className="text-white font-semibold text-caption">
                    {anim}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Durations</h3>
          <div className="space-y-sm text-body">
            <p>
              <strong>Fast (150ms):</strong> Quick feedback, micro-interactions
            </p>
            <p>
              <strong>Base (200ms):</strong> Standard transitions, slide animations
            </p>
            <p>
              <strong>Slow (300ms):</strong> Emphasis animations, important transitions
            </p>
          </div>
        </div>

        <div className="pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Easing Functions</h3>
          <div className="space-y-sm text-body">
            <p>
              <strong>ease-out:</strong> Enter animations, appearing elements
            </p>
            <p>
              <strong>ease-in:</strong> Exit animations, disappearing elements
            </p>
            <p>
              <strong>ease-in-out:</strong> Continuous transitions, size changes
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Breakpoints Story
export const Breakpoints = {
  render: () => {
    const breakpoints = [
      { name: 'Mobile', width: '375px', desc: 'Phones (iPhone SE minimum)' },
      { name: 'Tablet', width: '768px', desc: 'Tablets, large phones' },
      { name: 'Desktop', width: '1024px', desc: 'Desktops, laptops' },
      { name: 'Wide', width: '1440px', desc: 'Large displays' },
      { name: 'Ultrawide', width: '1920px', desc: '4K displays' },
    ];

    return (
      <div className="space-y-2xl">
        <div>
          <h2 className="text-h2 font-bold mb-lg">Responsive Breakpoints</h2>
          <div className="space-y-md">
            {breakpoints.map((bp) => (
              <div key={bp.name} className="bg-dark-surface p-lg rounded-lg">
                <div className="flex items-baseline gap-md">
                  <p className="font-semibold text-body">{bp.name}</p>
                  <p className="text-h3">{bp.width}</p>
                </div>
                <p className="text-caption text-text-secondary mt-sm">
                  {bp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-lg border-t border-dark-border space-y-md">
          <h3 className="text-h2 font-bold">Mobile-First Approach</h3>
          <div className="bg-accent-red bg-opacity-20 p-lg rounded-lg border border-accent-red border-opacity-50 space-y-md">
            <code className="text-body font-mono">
              {`<div className="text-h3 tablet:text-h2 desktop:text-h1">`}
            </code>
            <p className="text-body">
              ✓ Style mobile first (16px), then add tablet (20px), then
              desktop (28px)
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Z-Index Story
export const ZIndex = {
  render: () => {
    const zIndices = [
      { level: 'base', value: '0', use: 'Normal content' },
      { level: 'dropdown', value: '100', use: 'Dropdowns, menus' },
      { level: 'sticky', value: '200', use: 'Sticky headers' },
      { level: 'fixed', value: '250', use: 'Fixed positioned' },
      { level: 'modal-overlay', value: '290', use: 'Modal background' },
      { level: 'modal', value: '300', use: 'Modals' },
      { level: 'tooltip', value: '400', use: 'Tooltips' },
      { level: 'alert', value: '500', use: 'Alerts' },
      { level: 'max', value: '9999', use: 'Emergency' },
    ];

    return (
      <div className="space-y-lg">
        <h2 className="text-h2 font-bold">Z-Index Scale</h2>
        <div className="space-y-md">
          {zIndices.map((zi) => (
            <div key={zi.level} className="bg-dark-surface p-md rounded-lg">
              <div className="flex items-center gap-md">
                <div className="flex-1">
                  <p className="font-semibold font-mono">{zi.level}</p>
                  <p className="text-caption text-text-secondary">{zi.use}</p>
                </div>
                <p className="text-h3 font-bold text-accent-red">{zi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
