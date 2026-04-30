# mFLOCSS Starter

mFLOCSS のリファレンス実装。架空の美容サロン「iluha」の LP をサンプルとして、テキストや画像を差し替えるだけでそのまま使える構成です。

## クイックスタート

1. GitHub の「**Use this template**」ボタンから新しいリポジトリを作成
2. 作成したリポジトリをクローン:
   ```bash
   git clone https://github.com/<your-name>/<your-repo>.git
   cd <your-repo>
   npm install
   npm run dev
   ```
3. ターミナルに表示された URL をブラウザで開き、LP が表示されることを確認

## カスタマイズ

プロジェクト全体で `CUSTOMIZE` を検索すると、差し替えポイントが見つかります（HTML・CSS・vite.config.ts）。

### テキスト・画像の差し替え

- `src/index.html` — サービス名、キャッチコピー、各セクションのテキスト、Contact セクションのフォーム項目
- `src/privacy/index.html` — プライバシーポリシー本文
- `src/404.html` — 404 ページの見出し・リード文
- 全ページの `<head>` — title, description, OGP 情報
- `src/assets/images/` — コンテンツ画像（Retina 対応のため表示サイズの **2倍** で書き出し）

### favicon・OGP の差し替え

`public/` 配下のファイルを差し替えます:

| ファイル | サイズ | 用途 |
|---------|--------|------|
| `favicon.svg` | — | モダンブラウザ用 |
| `favicon.ico` | 32×32 | レガシーブラウザ用 |
| `apple-touch-icon.png` | 180×180 | iOS ホーム画面 |
| `ogp.png` | 1200×630 | SNS シェア画像 |

### 色の変え方

`src/assets/css/token/color.css` の `/* CUSTOMIZE */` セクションにあるカラーパレットを差し替えます。

```css
:root {
  /* Main — セージグリーン（H:150） */
  --_sage-400: oklch(65% 0.08 150deg);  /* ← 色相(H)を変えるだけで印象が変わる */
  --_sage-600: oklch(45% 0.1 150deg);

  /* Accent — テラコッタ（H:35） */
  --_terracotta-400: oklch(65% 0.12 35deg);
  --_terracotta-500: oklch(55% 0.15 35deg);
}
```

`color.css` がセマンティック変数を通して全体に反映するため、パレットを変えるだけで LP 全体の配色が切り替わります。oklch 以外の形式（HEX, rgb 等）でも動作します。

### 余白・文字サイズの変え方

Token 層（`src/assets/css/token/`）にデザイン値が集約されています。`--px` ヘルパー（`calc(1rem / 16)`）により、数値はデザインカンプの px 指定値をそのまま記述できます。

```css
/* 数値を変えるだけ。rem への変換は --px が担う */
--space-lg: calc(24 * var(--px));   /* 24px 相当の rem */
--font-size-h1: clamp(calc(32 * var(--px)), 4vi + 1rem, calc(56 * var(--px)));
```

### 外部フォントの追加

1. 全ページの `<head>` にフォントの `<link>` タグを追加（例: Google Fonts）
2. `src/assets/css/token/typography.css` の `--font-family` を変更:
   ```css
   --font-family: 'Inter', 'Noto Sans JP', sans-serif;
   ```

### ダークモード

初期設定では OS のダークモード設定に自動追従します（手動切り替え UI はありません）。

**無効化する場合:**

1. 全ページの `<meta name="color-scheme" content="light dark">` を `<meta name="color-scheme" content="light">` に変更
2. `src/assets/css/token/color.css` の `light-dark()` 関数を light 側の値に置き換え

```css
/* Before */
--color-main: light-dark(var(--_sage-600), var(--_sage-400));

/* After */
--color-main: var(--_sage-600);
```

### ブレークポイントの変更

デフォルトのブレークポイントは `768px` です。CSS の仕様上 `@media` にカスタムプロパティは使えないため、変更する場合はプロジェクト全体で `768px` を検索置換してください。

### フォーム送信先の設定

Contact セクション（`src/index.html` 内）のフォームは `action="/api/contact"` を既定値としています。starter 自体は送信処理を提供しないため、外部フォームサービスやバックエンド API に差し替えてください:

```html
<form class="c-form p-contact__form" action="https://your-form-service.com/submit" method="post">
```

## 構造の変更

### セクションの追加

1. `src/index.html` に `<section class="l-section p-<名前>">` を追加
2. `src/assets/css/project/p-<名前>.css` を作成
3. `style.css` に `@import './project/p-<名前>.css' layer(project);` を追加
4. ヘッダーのナビリンクに `#<名前>` を追加（必要に応じて）

### セクションの削除

各セクションは独立しているため、HTML の `<section>` ブロックを削除するだけで動作します。

1. 対象の `<section>` を HTML から削除
2. `npm run dev` で表示を確認
3. 使わなくなった CSS ファイルがあれば `style.css` の `@import` を削除

セクション間に依存関係はありません。ヘッダーのナビリンク（`#features` 等）だけ、削除したセクションへのリンクを忘れずに除去してください。

### ページの追加

1. `src/` に新しいディレクトリと `index.html` を作成（例: `src/about/index.html`）
2. `vite.config.ts` の `rolldownOptions.input` にエントリを追加:
   ```ts
   about: resolve(__dirname, 'src/about/index.html'),
   ```
3. ヘッダー・フッターのナビリンクを全ページに追加
4. 必要に応じて Project CSS を作成し `style.css` に `@import` を追加

### ページの削除

1. 対象のディレクトリを削除（例: `src/privacy/`）
2. `vite.config.ts` の `rolldownOptions.input` から該当エントリを削除
3. ヘッダー・フッターのナビリンクを全ページから除去
4. 不要な Project CSS があれば `style.css` の `@import` を削除

## ビルドと納品

```bash
npm run build
```

`dist/` ディレクトリに最適化されたファイルが出力されます。そのまま静的ホスティング（Netlify, Vercel, Cloudflare Pages 等）にデプロイできます。

サブディレクトリ（例: `https://example.com/my-site/`）にデプロイする場合は、`vite.config.ts` の `base` を変更してください:

```ts
base: '/my-site/',
```

納品前にプロジェクト全体で `CUSTOMIZE` を検索し、差し替え忘れがないことを確認してください。

## 404 ページの動作確認

### 本番デプロイ後

`dist/404.html` を root に置けば、Cloudflare Pages / Netlify / Vercel / GitHub Pages 等が **404 Not Found 時に自動配信** します。設定ファイル（`_redirects` 等）は不要です。

### ローカル `pnpm preview`

`vite.config.ts` の `preview-404-fallback` plugin により、存在しない URL アクセスで `dist/404.html` が表示されます。

```bash
pnpm build
pnpm preview
# ブラウザで http://localhost:4173/nonexistent などにアクセス → カスタム 404 ページ表示
```

### 直接アクセス

`http://localhost:4173/404.html` で 404.html の内容を直接確認できます。

## リファレンス

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（HMR 有効） |
| `npm run build` | 本番ビルド（dist/ に出力） |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run check` | format + lint を一括実行 |
| `npm run format` | Prettier でコードを整形 |
| `npm run lint:css` | Stylelint でスタイルを検査 |
| `npm run lint:js` | ESLint でスクリプトを検査 |
| `npm run lint:html` | markuplint で HTML を検査 |

### 対象ブラウザ

Baseline Newly Available（全モダンブラウザの最新安定版でサポート済みの機能を使用）

使用しているモダン CSS: `@layer`, `@container`, CSS Nesting, `:has()`, `:where()`, `oklch()`, `light-dark()`, 論理プロパティ, `clamp()`

### ファイル構成

```
src/
├── assets/
│   ├── css/
│   │   ├── style.css          # エントリポイント
│   │   ├── layer-order.css    # @layer 先制宣言
│   │   ├── token/             # デザイントークン（カラー・タイポグラフィ・余白等）
│   │   ├── reset/             # ブラウザリセット
│   │   ├── foundation/        # 要素の基本スタイル（base + form）
│   │   ├── layout/            # レイアウトプリミティブ
│   │   ├── component/         # 再利用可能な UI パーツ
│   │   ├── project/           # ページ固有のスタイル
│   │   ├── animation/         # 装飾的アニメーション
│   │   └── utility/           # ユーティリティ
│   ├── images/                # コンテンツ画像（ビルドでハッシュ付与）
│   └── scripts/
│       └── main.js            # ドロワー・アニメーション・Back to Top
├── index.html             # トップページ（Hero〜Contact セクション統合）
├── privacy/index.html     # プライバシーポリシー
└── 404.html               # 404 ページ（カスタマイズして使う）
public/                    # ルートパス固定のファイル
├── scripts/
│   └── viewport.js        # ビューポート幅制御（--viewport-min 未満の端末向け）
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
└── ogp.png
```

## パッケージマネージャー

本 starter は pnpm で開発されており、`pnpm-lock.yaml` が commit されています。エンドユーザーは **npm / pnpm / yarn** のいずれでも動作します:

- 本 README の手順は **npm** で記述（Node.js 同梱ツールのため追加インストール不要）
- `pnpm install` でも動作（付属の `pnpm-lock.yaml` で高速・再現可能インストール）
- `npm install` でも動作（`pnpm-lock.yaml` は無視され、独自に `package-lock.json` がローカル生成される）

### 生成された lockfile の扱い

`npm install` した場合、`package-lock.json` が生成されます。これを commit するかどうかは、あなたのプロジェクトの方針で判断してください（個人プロジェクト・チーム開発では一般的に commit します）。

Starter 開発（Contribute）の場合は pnpm 推奨。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) 参照。

## GitHub Actions CI

本リポジトリには `.github/workflows/check.yml` で `pnpm run check` + `pnpm run build` を検証する CI が設定されています。

- **本体リポ（mflocss/starter）**: PR / push 時に自動発動
- **Fork / Clone したリポ**: `if: github.repository == 'mflocss/starter'` の条件で**自動 skip**（Fork 直後に Actions が意図せず走らない設計）
- **自分のプロジェクトで有効化する場合**: `.github/workflows/check.yml` の `jobs.check.if` 行を削除してください

これにより「starter 本体の品質ゲート」と「ユーザーに優しいテンプレート」の両立を実現しています。

## 設計判断の詳細

starter で採用している設計判断（Component 原則・順序ルール・コメント方針・命名規則等）の詳細は以下を参照してください:

- [mFLOCSS 仕様書](https://mflocss.dev) — 公式規範（MUST / SHOULD / MAY、無料）
- [そのFLOCSS、なぜそこに書いた？](https://zenn.dev/shunei/books/mflocss-design) — 公式書籍、判断基準の詳細解説（Zenn、一部無料・全編有料）

## 関連リンク

- [デモサイト](https://starter.mflocss.dev) — starter のライブプレビュー
- [そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準](https://zenn.dev/shunei/books/mflocss-design)
- [mFLOCSS 仕様書](https://mflocss.dev)

## ライセンス

MIT
