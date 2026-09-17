import { defineConfig, type Plugin } from 'vite';
import { join, relative, resolve, sep } from 'path';
import fs, { globSync } from 'fs';

const srcDir = resolve(import.meta.dirname, 'src');
// src 配下の HTML をビルド対象にする（ページを増減しても設定の更新は不要）。
// キーは拡張子を落とした相対パスなので、`about.html` と `about/index.html` が同じキーになって
// 片方が黙って消えることがない
const htmlEntries = Object.fromEntries(
  globSync('**/*.html', { cwd: srcDir, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const file = relative(srcDir, join(entry.parentPath, entry.name));
      const name = file
        .split(sep)
        .join('/')
        .replace(/\.html$/, '');
      return [name, resolve(srcDir, file)];
    }),
);

// Vite が base を前置するのは img / link / script 等の asset 属性だけで、`<a href>` は対象外。
// Why not `%BASE_URL%`: HTML の環境変数展開でも前置されるが、markuplint の URL 妥当性検査が error になる。
function baseAnchorHref(): Plugin {
  let base = '/';
  // 対象は `<a>` だけ。`<a-widget>` のようなカスタム要素を巻き込まないよう後続の 1 文字を見る
  const anchorRootHref = /(<a(?=[\s>])[^>]*\shref=")\/(?!\/)/g;
  // 前置されずに残ったルート絶対パスの検出用。`<a href>` の取りこぼし（属性値の中に `>` がある、
  // 単一引用符、大文字の HREF、`=` の前後の空白）を拾うため、上の式より緩く書く
  const anyRootHref = /(?<=\s)href\s*=\s*["']\/(?!\/)[^"']*/gi;
  const hrefValue = (match: string) => match.replace(/^href\s*=\s*["']/i, '');
  const absoluteUrlBase = /^([a-z][a-z0-9+.-]*:)?\/\//i;

  return {
    name: 'base-anchor-href',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // 絶対 URL の base はアセットの配信先を指す。ルート絶対パスの `<a href>` は表示中のページの
        // オリジンを基準に解決されるので、ページ側に前置するのはパス部分だけでよい
        // （HTML が CDN 側にあっても自オリジンにあっても、同じ書き方で正しく解決される）
        const basePath = absoluteUrlBase.test(base) ? new URL(base, 'http://vite.dev').pathname : base;
        if (basePath === '/') return html;

        // 相対 base（`./`）ではルート絶対パスの配信先が決まらない。前置しても直らないので、
        // 壊れたリンクを配信せずビルドを止める
        if (!basePath.startsWith('/')) {
          const unresolvable = html.match(anyRootHref) ?? [];
          if (unresolvable.length > 0) {
            throw new Error(
              `base-anchor-href: base が "${base}" のとき、ルート絶対パスの href は解決できません` +
                `（${ctx.filename}）: ${unresolvable.join(', ')}\n` +
                'パス形式の base（例: "/my-site/"）にするか、リンクを相対パスに書き換えてください。',
            );
          }
          return html;
        }

        const transformed = html.replace(anchorRootHref, (_match, tagAndAttr: string) => tagAndAttr + basePath);

        // 取りこぼしを黙って通さない。壊れたリンクを配信するよりビルドを止める。
        // Why not CI で守る: この throw 自体は CI では検証していない（CI が確かめるのは前置が
        // 効いていることだけ）。この行を消しても CI は緑のまま通る
        const stray = (transformed.match(anyRootHref) ?? []).filter((match) => !hrefValue(match).startsWith(basePath));
        if (stray.length > 0) {
          throw new Error(
            `base-anchor-href: base を前置できない href があります（${ctx.filename}）: ${stray.join(', ')}\n` +
              '対象は `<a href="/...">` です。<area> やカスタム要素の href は手で直してください。\n' +
              '文字参照（`&#47;`）や引用符を省いた href（`href=/...`）はこの検査にかからないので使わないでください。',
          );
        }
        return transformed;
      },
    },
  };
}

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
      input: htmlEntries,
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
    baseAnchorHref(),

    // Cloudflare Pages / Netlify / Vercel / GitHub Pages は、出力先の直下に置いた 404.html を
    // 404 Not Found 時に自動配信する。これは規格ではなく各社が共通して実装している慣行。
    // 本 plugin が `npm run preview` で再現するのはこの 1 点だけで、本番の挙動全体ではない
    // （再現しない経路の例は CODING_GUIDE の「404 ページの動作確認」を参照）。
    {
      name: 'preview-404-fallback',
      configurePreviewServer(server) {
        // vite の preview 自身が配信先に使うのと同じ environments.client.build.outDir から算出する。
        // ハードコードすると outDir を変えたときに 404.html が見つからず、フォールバックが黙って
        // 効かなくなる（トップレベルの build.outDir を読むと、環境ごとに上書きされた場合にずれる）。
        // resolve の第 2 引数が絶対パスならそれが採られるので、相対・絶対のどちらでも通る
        // （vite は相対 outDir を root 基準で解決するが、解決後の config には生の値が残る）
        const distDir = resolve(server.config.root, server.config.environments.client.build.outDir);

        return () => {
          server.middlewares.use((req, res, next) => {
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
