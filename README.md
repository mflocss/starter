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

- `src/index.html` — サービス名、キャッチコピー、各セクションのテキスト
- `src/contact/index.html` — フォーム項目
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

現状は `action="/thanks/"` が設定されており、送信後にサンクスページへ遷移します。外部フォームサービスを使う場合は `action` をサービスの URL に変更してください:

```html
<form class="p-contact__form" action="https://your-form-service.com/submit" method="post">
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

1. 対象のディレクトリを削除（例: `src/thanks/`）
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

> **注意:** `text-spacing-trim` は Chrome のみ対応（Safari・Firefox 未対応、2026年4月時点）。未対応ブラウザでは無視されるため、表示が崩れることはありません。

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
├── index.html             # トップページ
├── contact/index.html     # お問い合わせ
├── thanks/index.html      # サンクスページ
└── privacy/index.html     # プライバシーポリシー
public/                    # ルートパス固定のファイル
├── scripts/
│   └── viewport.js        # ビューポート幅制御（--viewport-min 未満の端末向け）
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
└── ogp.png
```

## 関連リンク

- [デモサイト](https://starter.mflocss.dev) — starter のライブプレビュー
- [そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準](https://zenn.dev/shunei/books/mflocss-design)
- [mFLOCSS 仕様書](https://mflocss.dev)

## ライセンス

MIT
