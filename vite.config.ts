import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  appType: 'mpa',
  root: 'src',
  // CUSTOMIZE: サブディレクトリにデプロイする場合はパスを変更（例: '/my-site/'）
  base: '/',

  build: {
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
});
