import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const alias = {
  '@core': path.resolve(srcDir, 'core'),
  '@engine': path.resolve(srcDir, 'engine'),
  '@game': path.resolve(srcDir, 'game'),
  '@ui': path.resolve(srcDir, 'ui'),
  '@content': path.resolve(srcDir, 'content')
} as const;

export default defineConfig({
  base: './',
  publicDir: 'public',
  resolve: {
    alias
  },
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true
  },
  server: {
    open: true
  },
  test: {
    globals: true,
    environment: 'node',
    alias
  }
});
