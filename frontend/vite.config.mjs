import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile()
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy específico para API do Tiny
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
  },
  build: {
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      output: {
        // Removido manualChunks e inlineDynamicImports
      },
    },
  },
})