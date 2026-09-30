import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

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
  base: './', // Относительные пути для корректной работы в VK Mini Apps

  plugins: [
    react(),
    handleModuleDirectivesPlugin(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],

  build: {
    outDir: 'dist', // <-- ВАЖНО: Vercel по умолчанию ожидает папку dist
    chunkSizeWarningLimit: 1000, // <-- Игнорируем предупреждения о больших файлах
  },
});