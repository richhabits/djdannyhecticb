import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './client/src/**/*.{js,ts,jsx,tsx}',
    './client/index.html',
  ],
  theme: {
    extend: {
      /* Color Extensions */
      colors: {
        dark: {
          bg: '#0A0A0A',
          surface: '#1F1F1F',
          border: '#333333',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#999999',
          tertiary: '#666666',
        },
        accent: {
          red: '#FF4444',
          'red-hover': '#FF5555',
          'red-dark': '#CC3333',
          success: '#22C55E',
          'success-hover': '#34D399',
          warning: '#EAB308',
          'warning-hover': '#FACC15',
          danger: '#EF4444',
          'danger-hover': '#F87171',
          orange: '#F97316',
          'orange-hover': '#FB923C',
        },
        tier: {
          gold: '#D4AF37',
          'gold-dark': '#AA8C2C',
          silver: '#C0C0C0',
          'silver-dark': '#999999',
          bronze: '#CD7F32',
          'bronze-dark': '#A85F28',
          platinum: '#9D4EDD',
          'platinum-dark': '#7D3FCC',
        },
      },

      /* Spacing Extensions */
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },

      /* Font Size Extensions */
      fontSize: {
        micro: ['10px', { lineHeight: '1.4' }],
        caption: ['12px', { lineHeight: '1.5' }],
        body: ['14px', { lineHeight: '1.5' }],
        h3: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '1.3', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        display: ['36px', { lineHeight: '1.1', fontWeight: '700' }],
      },

      /* Font Weight Extensions */
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      /* Font Family Extensions */
      fontFamily: {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
        inter: '"Inter", sans-serif',
        outfit: '"Outfit", sans-serif',
      },

      /* Border Radius Extensions */
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },

      /* Box Shadow Extensions */
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
        xl: '0 12px 32px rgba(0, 0, 0, 0.6)',
        '2xl': '0 16px 40px rgba(0, 0, 0, 0.7)',
        elevated: '0 20px 48px rgba(0, 0, 0, 0.8)',
      },

      /* Transition Duration Extensions */
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '400ms',
        slowest: '500ms',
      },

      /* Transition Timing Function Extensions */
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        'ease-in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        linear: 'linear',
      },

      /* Screen/Breakpoint Extensions */
      screens: {
        mobile: '375px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px',
        ultrawide: '1920px',
      },

      /* Z-Index Extensions */
      zIndex: {
        base: '0',
        dropdown: '100',
        sticky: '200',
        fixed: '250',
        modal: '300',
        'modal-overlay': '290',
        tooltip: '400',
        alert: '500',
        max: '9999',
      },

      /* Animation Extensions */
      animation: {
        'slide-in-top': 'slideInFromTop 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-bottom': 'slideInFromBottom 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left': 'slideInFromLeft 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInFromRight 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-out-left': 'slideOutToLeft 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-out-right': 'slideOutToRight 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-out': 'fadeOut 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-out': 'scaleOut 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-soft': 'pulse 300ms infinite',
        'bounce-soft': 'bounce 200ms infinite',
        shimmer: 'shimmer 2s infinite',
        spin: 'spin 500ms linear infinite',
        'spin-fast': 'spin 300ms linear infinite',
        glitch: 'glitch 200ms infinite',
        marquee: 'marquee 20s linear infinite',
        heartbeat: 'heartbeat 300ms infinite',
        wiggle: 'wiggle 300ms infinite',
      },

      /* Keyframes Definitions */
      keyframes: {
        slideInFromTop: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromBottom: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromLeft: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutToLeft: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(-20px)', opacity: '0' },
        },
        slideOutToRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(20px)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        glitch: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-1px, 1px)' },
          '50%': { transform: 'translate(1px, -1px)' },
          '75%': { transform: 'translate(-1px, -1px)' },
          '100%': { transform: 'translate(1px, 1px)' },
        },
        marquee: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-100%, 0)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
      },

      /* Max Width Extensions */
      maxWidth: {
        container: '1440px',
      },

      /* Line Height Extensions */
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.6',
        loose: '1.8',
      },

      /* Opacity Extensions */
      opacity: {
        disabled: '0.5',
        hover: '0.8',
        active: '0.9',
        subtle: '0.1',
        medium: '0.5',
        strong: '0.8',
      },
    },
  },
  plugins: [],
}

export default config
