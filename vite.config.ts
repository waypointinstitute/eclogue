import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true
  },
  server: {
    open: true
  }
});
