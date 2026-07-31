import { defineConfig } from 'vite'

export default defineConfig({
  base: '/file-converter/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['jszip', 'file-saver', 'papaparse', 'js-yaml', '@iarna/toml', 'xlsx', 'mammoth', 'html2canvas', 'jspdf']
        }
      }
    }
  }
})