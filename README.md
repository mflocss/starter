# mFLOCSS Starter

mFLOCSS のリファレンス実装。**実装者 / Web 制作者 / AI agent** がモダンで高品質な CSS 設計を学び、テンプレートとしてそのまま案件に投入できます。架空の美容サロン「iluha」の LP をサンプルとして、テキストや画像を差し替えるだけで使い始められます。

使うときの運用ガイド: [CODING_GUIDE.md](./CODING_GUIDE.md) / 貢献・コード規約: [CONTRIBUTING.md](./CONTRIBUTING.md) / 設計判断の詳細: [mFLOCSS 書籍](https://zenn.dev/shunei/books/mflocss-design)

## クイックスタート

> **前提**: 実行には Node.js が必要です（v24 で動作確認）。未導入なら [nodejs.org](https://nodejs.org/) から LTS 版を入れてください（パッケージ管理コマンドの `npm` も同梱されます）。

1. GitHub の「**Use this template**」ボタンから新しいリポジトリを作成
2. 作成したリポジトリをクローン:
   ```bash
   git clone https://github.com/<your-name>/<your-repo>.git
   cd <your-repo>
   npm install
   npm run dev
   ```
   pnpm でも可（推奨: `pnpm install` で同梱 `pnpm-lock.yaml` による再現ビルド。詳細は [CODING_GUIDE.md](./CODING_GUIDE.md#パッケージマネージャー) 参照）。
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
├── assets/
│   └── scripts/
│       └── viewport.js    # ビューポート幅制御（--viewport-min 未満の端末向け）
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
└── ogp.png
```

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

## 関連リンク

リポ内ドキュメント:

- [CODING_GUIDE.md](./CODING_GUIDE.md) — starter を使うときの運用ガイド（ビルド / カスタマイズ / メンテ / デプロイ）
- [CONTRIBUTING.md](./CONTRIBUTING.md) — starter 本体への貢献フローとコード規約
- [CHANGELOG.md](./CHANGELOG.md) — 変更履歴（Keep a Changelog 準拠）

mFLOCSS エコシステム:

- [mFLOCSS 公式サイト](https://mflocss.dev/) — 認知 → 理解 → 書籍購入のファネル中枢、エコシステム全体ナビ
- [デモサイト](https://starter.mflocss.dev) — starter のライブプレビュー
- [そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準](https://zenn.dev/shunei/books/mflocss-design)
- [mFLOCSS 仕様書](https://github.com/mflocss/spec)

## ライセンス

MIT
