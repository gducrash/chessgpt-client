import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePluginRadar } from 'vite-plugin-radar';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginRadar({
      analytics: {
        id: import.meta.VITE_GANALYTICS_KEY
      }
    })
  ],
});