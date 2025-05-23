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
      '/api/tiny': {
        target: 'https://api.tiny.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tiny/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Sending Request to Tiny API:', req.method, req.url);
            // Adiciona headers necessários para a API do Tiny
            proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            proxyReq.setHeader('Accept', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Received Response from Tiny API:', proxyRes.statusCode, req.url);
          });
        }
      },
      // Mantém o proxy genérico como fallback
      '/api': {
        target: 'https://api.tiny.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Adiciona headers necessários
            proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded')
          })
        }
      }
    }
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