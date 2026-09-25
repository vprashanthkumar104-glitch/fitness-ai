import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, Plugin} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe HMR plugin to prevent WebSocket closed without opened rejections
// in containerized proxy preview environments where WebSocket HMR port is closed
function safeHmrPlugin(): Plugin {
  return {
    name: 'safe-preview-hmr',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs') || id.includes('@vite/client')) {
        return {
          code: code
            .replace(/console\.debug\("\[vite\] connecting\.\.\."\);/, '')
            .replace(
              /const transport = normalizeModuleRunnerTransport\([\s\S]*?\)\(\)\);/m,
              'const transport = { connect: () => Promise.resolve(), disconnect: () => Promise.resolve(), send: () => {} };'
            )
            .replaceAll('WebSocket closed without opened.', ''),
        };
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), safeHmrPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
      watch: null,
    },
  };
});
