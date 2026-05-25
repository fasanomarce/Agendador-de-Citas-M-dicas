/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinica: {
          50: 'hsl(180, 60%, 98%)',
          100: 'hsl(180, 65%, 95%)',
          200: 'hsl(180, 60%, 88%)',
          300: 'hsl(180, 55%, 78%)',
          400: 'hsl(180, 50%, 65%)',
          500: 'hsl(180, 70%, 45%)', // Accent cian
          600: 'hsl(180, 75%, 38%)',
          700: 'hsl(180, 80%, 30%)',
          800: 'hsl(215, 80%, 22%)', // Azul profundo
          900: 'hsl(215, 80%, 15%)', // Azul marino Avila
          950: 'hsl(215, 85%, 10%)',
        },
        paciente: {
          soft: 'hsl(220, 15%, 97%)',
          dark: 'hsl(215, 25%, 27%)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'premium': '0 20px 40px -15px rgba(15, 23, 42, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
