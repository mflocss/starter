import { defineConfig } from 'vite';
import { resolve, sep } from 'path';
import fs from 'fs';

export default defineConfig({
  appType: 'mpa',
  root: 'src',
  // CUSTOMIZE: サブディレクトリにデプロイする場合はパスを変更（例: '/my-site/'）
  // `<a href>` は base の書き換え対象外。base を変えたらルート絶対パスのリンクを手で直す
  base: '/',

  css: {
    transformer: 'lightningcss',
  },

  build: {
    cssMinify: 'lightningcss',
    rolldownOptions: {
      // CUSTOMIZE: ページの追加・削除時にエントリを更新
      input: {
        index: resolve(import.meta.dirname, 'src/index.html'),
        privacy: resolve(import.meta.dirname, 'src/privacy/index.html'),
        notFound: resolve(import.meta.dirname, 'src/404.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((n) => n.endsWith('.css'))) {
            return 'assets/css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        entryFileNames: 'assets/scripts/[name].js',
        chunkFileNames: 'assets/scripts/[name].js',
      },
    },
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },

  publicDir: resolve(import.meta.dirname, 'public'),

  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
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
            const distDir = resolve(import.meta.dirname, 'dist');

            // percent-encoded なパス（日本語ディレクトリ名等）を実ファイル名へ戻す。正規化は下流の middleware に合わせる
            let pathname: string | null = null;
            try {
              pathname = decodeURIComponent((req.url || '/').replace(/[?#].*$/s, ''));
            } catch {
              pathname = null;
            }

            // 復号で %2F が区切りに戻るため、`..` で dist の外を指し得る
            const isInsideDist = (candidate: string) => candidate === distDir || candidate.startsWith(distDir + sep);

            // 既存ファイル / ディレクトリが存在する場合は Vite に処理を委譲する
            if (pathname !== null) {
              const base = resolve(distDir, '.' + pathname);
              const candidates = [base, resolve(base, 'index.html')];

              for (const candidate of candidates) {
                if (isInsideDist(candidate) && fs.existsSync(candidate)) {
                  return next();
                }
              }
            }

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
