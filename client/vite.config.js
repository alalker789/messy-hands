import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api is proxied to Express in development, so the browser sees a single origin
// (camera and mic work on http://localhost without HTTPS).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
