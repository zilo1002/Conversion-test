import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Conversion-test/',
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