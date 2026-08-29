import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false
  },
  test: {
    environment: 'jsdom',
    globals: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'vendor-d3';
          }
          if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) {
            return 'vendor-leaflet';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@google/genai/')) {
            return 'vendor-genai';
          }
          if (
            id.includes('src/data/species.json') ||
            id.includes('src/data/taxonomy.json') ||
            id.includes('src/data/ebas.json')
          ) {
            return 'data-species';
          }
        }
      }
    }
  }
});

