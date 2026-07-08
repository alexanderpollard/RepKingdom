import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '/RepKingdom/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          darkMode: ["class"],
          content: ["./index.html", "./src/**/*.{js,jsx}"],
          theme: {
            extend: {
              borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.25rem' },
              colors: {
                background: 'hsl(240 10% 3.9%)',
                foreground: 'hsl(0 0% 98%)',
                card: { DEFAULT: 'hsl(240 6% 10%)', foreground: 'hsl(0 0% 98%)' },
                primary: { DEFAULT: 'hsl(142 71% 45%)', foreground: 'hsl(240 10% 4%)' },
                secondary: { DEFAULT: 'hsl(38 92% 50%)', foreground: 'hsl(240 10% 4%)' },
                muted: { DEFAULT: 'hsl(240 5% 20%)', foreground: 'hsl(240 5% 65%)' },
                destructive: { DEFAULT: 'hsl(0 72% 51%)', foreground: 'hsl(0 0% 98%)' },
                border: 'hsl(240 5% 15%)',
                input: 'hsl(240 5% 12%)',
                ring: 'hsl(142 71% 45%)'
              }
            }
          }
        }),
        autoprefixer()
      ]
    }
  }
});
