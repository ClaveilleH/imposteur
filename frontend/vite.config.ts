import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // host: true => écoute sur toutes les interfaces (0.0.0.0) pour être
    // accessible depuis un téléphone sur le même réseau Wi-Fi.
    host: true,
    // Proxy /api vers le backend en dev pour éviter les soucis de CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
