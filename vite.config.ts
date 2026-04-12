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
        contact: resolve(__dirname, 'src/contact/index.html'),
        thanks: resolve(__dirname, 'src/contact/thanks/index.html'),
        privacy: resolve(__dirname, 'src/privacy/index.html'),
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
