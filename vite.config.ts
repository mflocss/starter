import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  appType: 'mpa',
  root: 'src',
  // CUSTOMIZE: サブディレクトリにデプロイする場合はパスを変更（例: '/my-site/'）
  base: '/',

  css: {
    transformer: 'lightningcss',
  },

  build: {
    cssMinify: 'lightningcss',
    rolldownOptions: {
      // CUSTOMIZE: ページの追加・削除時にエントリを更新
      input: {
        main: resolve(__dirname, 'src/index.html'),
        privacy: resolve(__dirname, 'src/privacy/index.html'),
        notFound: resolve(__dirname, 'src/404.html'),
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  publicDir: resolve(__dirname, 'public'),

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    // 本番ホスティング（Cloudflare Pages / Netlify / Vercel 等）は dist/404.html を
    // 404 Not Found 時に自動配信する標準仕様。本 plugin はローカル `pnpm preview` で
    // 同じ動作を再現するため。
    {
      name: 'preview-404-fallback',
      configurePreviewServer(server) {
        // pnpm preview で存在しない URL にアクセスした際に dist/404.html を 404 ステータスで返す
        // 本番（Cloudflare Pages / Netlify / Vercel 等）は 404.html を root に置くだけで自動配信される
        return () => {
          server.middlewares.use((req, res, next) => {
            const url = (req.url || '/').split('?')[0];
            const distDir = resolve(__dirname, 'dist');

            // 既存ファイル / ディレクトリが存在する場合は Vite に処理を委譲する
            // 候補 1: dist/{url}（静的ファイル直接 or ディレクトリ）
            // 候補 2: dist/{url}/index.html（ディレクトリ配下の index.html）
            const candidates = [resolve(distDir, url.slice(1)), resolve(distDir, url.slice(1), 'index.html')];

            for (const candidate of candidates) {
              if (fs.existsSync(candidate)) {
                return next();
              }
            }

            // どちらも存在しない → 404.html を 404 ステータスで返す
            const notFoundPath = resolve(distDir, '404.html');
            if (fs.existsSync(notFoundPath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              fs.createReadStream(notFoundPath).pipe(res);
              return;
            }

            next();
          });
        };
      },
    },
  ],
});
