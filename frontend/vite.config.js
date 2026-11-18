import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api calls are forwarded to the gateway (e.g. kubectl port-forward svc/gateway 8080:8080)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
});
