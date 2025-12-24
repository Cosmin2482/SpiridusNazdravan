import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files (local) or process.env (Vercel)
    // Vercel exposes env vars as process.env during build
    const env = loadEnv(mode, '.', '');
    
    // Get env vars from Vercel (process.env) or local (.env files)
    // Vercel makes env vars available as process.env during build
    const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    const geminiApiKeys = process.env.GEMINI_API_KEYS || env.GEMINI_API_KEYS || geminiApiKey;
    
    console.log('🔑 Building with API keys:', geminiApiKeys ? `${geminiApiKeys.split(',')[0].substring(0, 20)}...` : 'NOT FOUND');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Expose as process.env (works in both local and Vercel)
        // These are replaced at build time by Vite
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEYS': JSON.stringify(geminiApiKeys),
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
