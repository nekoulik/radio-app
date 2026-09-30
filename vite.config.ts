import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function handleModuleDirectivesPlugin() {
  return {
    name: 'handle-module-directives-plugin',
    transform(code: string, id: string) {
      if (id.includes('@vkontakte/icons')) {
        code = code.replace(/"use-client";?/g, '');
      }
      return { code };
    },
  };
}

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    handleModuleDirectivesPlugin(),
  ],

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
  },
});