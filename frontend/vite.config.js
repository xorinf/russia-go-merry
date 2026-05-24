import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 1. Plugins: Enables React support, including JSX compilation and Fast Refresh
  plugins: [react()],
  
  server: {
    // Locks the local development server to port 5173
    port: 5173,
    
    // 2. API Proxy: Automatically routes any frontend requests starting with '/api' to your local Node.js backend
    // This bypasses CORS issues entirely while working in local development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  
  // 3. Dependency Optimization: 
  // Tells Vite NOT to pre-bundle the Xenova library. Pre-bundling often breaks 
  // the dynamic WebAssembly (WASM) path loading that local AI models rely on.
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
  
  // 4. Web Worker Configuration:
  // Forces Web Workers to compile as ES Modules, which is required for loading 
  // complex multi-threaded tasks (like AI feature extraction) in the browser.
  worker: {
    format: 'es',
  },
});
