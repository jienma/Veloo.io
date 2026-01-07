import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        documentation: resolve(__dirname, 'docs.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    open: true
  }
});
