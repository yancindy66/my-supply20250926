import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(() => {
  const useProxy = String(process.env.VITE_USE_PROXY || 'true').toLowerCase() === 'true';
  const useMock = String(process.env.VITE_USE_MOCK || '').toLowerCase() === 'true';
  // 默认直连后端 8092（可通过 BACKEND_PORT 覆盖）
  const backendPort = Number(process.env.BACKEND_PORT || 8092);

  const plugins = [vue()];
  if (!useProxy && useMock) {
    plugins.push(
      viteMockServe({
        mockPath: 'mock',
        enable: true,
        watchFiles: true
      })
    );
  }

  return {
    plugins,
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: true,
      cors: true,
      strictPort: false,
      proxy: useProxy
        ? {
            '/api': {
              target: `http://127.0.0.1:${backendPort}`,
              changeOrigin: true
            },
            '/v1': {
              target: `http://127.0.0.1:${backendPort}`,
              changeOrigin: true
            }
          }
        : undefined
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };
});
