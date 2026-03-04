# mflocss/starter

Zenn 技術書「そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準」付属のリファレンス実装。

mFLOCSS × Vite × モダン CSS で作る、崩れない CSS 設計のリファレンス実装です。

## 必要環境

- Node.js 20 以上
- pnpm 9 以上（npm / yarn でも動きます）

## 5分で始める

### 1. リポジトリをテンプレートとして使用

GitHub の [Use this template] ボタンから新しいリポジトリを作成してください。

### 2. クローン

```bash
git clone https://github.com/あなたのユーザー名/あなたのリポジトリ名.git
cd あなたのリポジトリ名
```

### 3. 依存パッケージをインストール

```bash
pnpm install
```

### 4. 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 が開きます。
ファイルを編集すると自動でリロードされます。

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動（HMR 有効） |
| `pnpm build` | 本番ビルド（dist/ に出力） |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm lint:css` | Stylelint でスタイルを検査 |
| `pnpm lint:js` | ESLint でスクリプトを検査 |
| `pnpm format` | Prettier でコードを整形 |

## mFLOCSS の 8 層アーキテクチャ

FLOCSS の 3 層（Foundation / Layout / Object）を、モダン CSS に対応させた 8 層構成です。
CSS `@layer` で優先順位をブラウザが明示的に制御するため、詳細度の事故が起きません。

```
src/css/
├── tokens/       デザイントークン（色・フォント・余白等の設計変数）
├── theme/        セマンティックカラー・ダークモード
├── foundation/   リセット・ベーススタイル
├── layout/       セクション・サイトレイアウト
├── component/    汎用パーツ（ボタン・見出し等）
├── project/      ページ固有パーツ
├── animation/    アニメーション（reduced-motion 対応）
└── utility/      補助クラス
```

| 層 | プレフィックス | @layer | 役割 |
|----|-------------|--------|------|
| Tokens | — | tokens | デザイントークン（色・フォント・余白等の設計変数） |
| Theme | — | theme | セマンティックカラー・ダークモード |
| Foundation | — | foundation | カスタムリセット + ベーススタイル |
| Layout | `l-` | layout | セクション・サイトレイアウト |
| Component | `c-` | component | 複数ページで使い回す汎用パーツ |
| Project | `p-` | project | 特定のページ・機能に使うパーツ |
| Animation | `a-` | animation | スクロールアニメーション等 |
| Utility | `u-` | utility | 補助クラス（常に最優先で適用） |

## スタイルを追加する

「どのレイヤーに書くか迷う」という場合は、本の第3章を参照してください。

### 新しい Component を追加する場合

1. `src/css/component/c-card.css` を作成
2. `@layer component { }` で囲んで記述
3. `src/css/style.css` に `@import './component/c-card.css';` を追加

### 新しいページを追加する場合

1. `src/pages/新ページ名/index.html` を作成
2. `vite.config.ts` の `build.rollupOptions.input` に追加

## この本について

<!-- TODO: 公開後に URL を追加 -->
「そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準」

## ライセンス

MIT
