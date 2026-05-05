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

## ファイル構成

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

## カスタマイズ・構造の変更

詳細は **[mFLOCSS 書籍](https://zenn.dev/shunei/books/mflocss-design)** を参照してください。

差し替えポイントはコード全体で `CUSTOMIZE` コメントを検索すると発見できます（HTML・CSS・vite.config.ts に記載）。

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

### 404 ページの動作確認

`src/404.html` は本番ホスティングで存在しないパスにアクセスされた際の Not Found ページです。動作確認方法は以下の 3 通り:

| 確認方法 | URL | 期待動作 |
|---------|-----|---------|
| ローカル dev（見た目確認）| `http://localhost:5173/404.html` | HTTP 200 で配信（デザイン確認用、HMR 効く）|
| ローカル preview（HTTP 404 検証）| `http://localhost:4173/nonexistent` | `vite.config.ts` の preview-404-fallback plugin が HTTP 404 で配信 |
| 本番ホスティング | `https://example.com/nonexistent` | HTTP 404 で配信 |

ローカル動作確認の手順:

```bash
npm run build
npm run preview
# 別タブで http://localhost:4173/nonexistent にアクセス
```

本番側は **Cloudflare Pages / Netlify / Vercel / GitHub Pages のいずれも `dist/404.html` を root に配置するだけで自動配信**します（追加設定ファイル不要）。ローカル `npm run preview` でも同じ動作を再現するため `vite.config.ts` に `preview-404-fallback` plugin を含めています。

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

## パッケージマネージャー

本 starter は pnpm で開発されており、`pnpm-lock.yaml` が commit されています。エンドユーザーは **npm / pnpm / yarn** のいずれでも動作します:

- 本 README の手順は **npm** で記述（Node.js 同梱ツールのため追加インストール不要）
- `pnpm install` でも動作（付属の `pnpm-lock.yaml` で高速・再現可能インストール）
- `npm install` でも動作（`pnpm-lock.yaml` は無視され、独自に `package-lock.json` がローカル生成される）

### 生成された lockfile の扱い

`npm install` した場合、`package-lock.json` が生成されます。これを commit するかどうかは、あなたのプロジェクトの方針で判断してください（個人プロジェクト・チーム開発では一般的に commit します）。

Starter 開発（Contribute）の場合は pnpm 推奨。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) 参照。

## GitHub Actions CI

`.github/workflows/check.yml` 参照。Fork / Clone 後は自動 skip（自分のプロジェクトで有効化する場合は `jobs.check.if` 行を削除）。

## 関連リンク

リポ内ドキュメント:

- [CODING_GUIDE.md](./CODING_GUIDE.md) — starter のコードを書く / 拡張する開発者向けの規約
- [CHANGELOG.md](./CHANGELOG.md) — 変更履歴（Keep a Changelog 準拠）

mFLOCSS エコシステム:

- [mFLOCSS 公式サイト](https://mflocss.dev/) — 認知 → 理解 → 書籍購入のファネル中枢、エコシステム全体ナビ
- [デモサイト](https://starter.mflocss.dev) — starter のライブプレビュー
- [そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準](https://zenn.dev/shunei/books/mflocss-design)
- [mFLOCSS 仕様書](https://github.com/mflocss/spec)

## ライセンス

MIT
