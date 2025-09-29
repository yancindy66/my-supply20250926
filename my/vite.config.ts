import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(() => {
  const useProxy = String(process.env.VITE_USE_PROXY || 'true').toLowerCase() === 'true';
  const useMock = String(process.env.VITE_USE_MOCK || '').toLowerCase() === 'true';
  const backendPort = Number(process.env.BACKEND_PORT || 8080);

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
            }
          }
        : undefined
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  };
});
