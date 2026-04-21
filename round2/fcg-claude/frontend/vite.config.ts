import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = process.env['VITE_API_TARGET'] ?? 'http://localhost:8040';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3040,
    strictPort: true,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
