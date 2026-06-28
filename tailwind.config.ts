/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        auditor: {
          bg: '#070708',
          'bg-elevated': '#0c0c0f',
          surface: '#121216',
          'surface-hover': '#18181d',
          border: '#2a2a30',
          'border-subtle': '#1a1a1f',
          accent: '#8b5cf6',
          'accent-muted': 'rgba(139, 92, 246, 0.12)',
          'accent-hover': '#a78bfa',
          'accent-deep': '#7c3aed',
          success: '#34d399',
          'success-muted': 'rgba(52, 211, 153, 0.1)',
          warning: '#fbbf24',
          'warning-muted': 'rgba(251, 191, 36, 0.1)',
          danger: '#f87171',
          'danger-muted': 'rgba(248, 113, 113, 0.1)',
          muted: '#71717a',
          'muted-foreground': '#a1a1aa',
          text: '#fafafa',
          'text-secondary': '#d4d4d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.5625rem', { lineHeight: '0.75rem' }],
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        display: ['2.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '320ms',
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },
      borderRadius: {
        lg: '0.875rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        card: '0 1px 2px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.25)',
        glow: '0 0 32px rgba(139, 92, 246, 0.18)',
        'glow-sm': '0 0 16px rgba(139, 92, 246, 0.12)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        scan: 'scan 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '70%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(4px)', opacity: '1' },
        },
      },
      maxWidth: {
        report: '72rem',
      },
    },
  },
  plugins: [],
};
