import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // allows access from outside the container
    port: 5173,
    strictPort: true,
  },
});
