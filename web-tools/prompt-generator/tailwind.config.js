/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        random: 'var(--color-random)',
        background: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          selected: 'var(--color-bg-selected)',
          hover: 'var(--color-bg-hover)',
          locked: 'var(--color-bg-locked)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          placeholder: 'var(--color-text-placeholder)',
        },
        border: 'var(--color-border)',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        drawer: 'var(--shadow-drawer)',
      },
      spacing: {
        'padding': '1rem',
        'gap-sm': '0.75rem',
        'gap-md': '1rem',
        'gap-lg': '1.5rem',
      },
      fontSize: {
        'page-title': ['1.5rem', { fontWeight: '700' }],
        'section-title': ['1rem', { fontWeight: '600' }],
        'body': '0.875rem',
        'helper': '0.75rem',
        'label': ['0.75rem', { fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
