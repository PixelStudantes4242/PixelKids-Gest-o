import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
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
        name: 'pixelkids-server-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url) return next();

            const urlPath = req.url.split('?')[0];

            // 1. Redireciona o acesso inicial para a página de login
            if (urlPath === '/' || urlPath === '') {
              res.writeHead(302, { Location: '/login.html' });
              res.end();
              return;
            }

            // 2. Redirecionamento de compatibilidade com subpasta legada /PixelKids/
            if (urlPath.startsWith('/PixelKids/')) {
              const redirectUrl = req.url.replace(/^\/PixelKids\//, '/');
              res.writeHead(302, { Location: redirectUrl });
              res.end();
              return;
            }

            // 3. Servir arquivos da pasta public/ quando requisitados via /public/...
            if (urlPath.startsWith('/public/') || urlPath.startsWith('public/')) {
              const cleanPath = decodeURIComponent(urlPath.replace(/^\/?public\//, ''));
              const filePath = path.resolve(process.cwd(), 'public', cleanPath);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes: Record<string, string> = {
                  '.png': 'image/png',
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.ico': 'image/x-icon',
                  '.svg': 'image/svg+xml',
                  '.gif': 'image/gif',
                  '.webp': 'image/webp',
                };
                res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }

            next();
          });
        },
        closeBundle() {
          // Copia public/ para dist/public/ para garantir que caminhos relativos public/... funcionem no build
          const src = path.resolve(__dirname, 'public');
          const dest = path.resolve(__dirname, 'dist', 'public');
          if (fs.existsSync(src)) {
            fs.cpSync(src, dest, { recursive: true });
          }
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
