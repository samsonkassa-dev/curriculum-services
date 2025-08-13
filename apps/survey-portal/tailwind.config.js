/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    // Only scan the auth package component folders to avoid traversing node_modules
    "../../packages/auth/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/auth/components/ui/**/*.{js,ts,jsx,tsx}",
    "../../packages/auth/components/modals/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)'
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}


