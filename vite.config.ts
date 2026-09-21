import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: '.',
    publicDir: 'public',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'pixelkids-url-normalizer',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url) {
              // Redirect legacy /PixelKids/ subfolder paths to root
              if (req.url.startsWith('/PixelKids/')) {
                const redirectUrl = req.url.replace(/^\/PixelKids\//, '/');
                res.writeHead(302, { Location: redirectUrl });
                res.end();
                return;
              }
              // Normalize Windows backslashes
              if (req.url.includes('\\')) {
                req.url = req.url.replace(/\\+/g, '/');
              }
              // Normalize accidental /public/ in asset requests
              if (req.url.startsWith('/public/')) {
                req.url = req.url.replace(/^\/public\//, '/');
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          site: path.resolve(__dirname, 'site.html'),
          vendas: path.resolve(__dirname, 'vendas.html'),
          clientes: path.resolve(__dirname, 'clientes.html'),
          estoque: path.resolve(__dirname, 'estoque.html'),
          equipe: path.resolve(__dirname, 'equipe.html'),
        },
      },
    },
  };
});
