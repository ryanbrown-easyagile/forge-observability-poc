/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/sprint-notes-ui',
  server: {
    port: 4200,
    host: 'localhost',
  },
  assetsInclude: ['src/**/*.svg'],
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), eslint()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/sprint-notes-ui',
      provider: 'v8',
    },
  },
});
