# コーディングガイド

この starter を**使う（ビルド・カスタマイズ・メンテナンス・デプロイ）ときの運用ガイド**です。mFLOCSS 仕様書 v1.0 準拠のリファレンス実装として、パッケージ管理・CI・ビルド・アセット配置・コンポーネント運用の勘所をまとめています。

- **mFLOCSS の設計そのもの**（層の定義・命名規則・カスタムプロパティ参照ルール等）は [mFLOCSS 仕様書](https://github.com/mflocss/spec) と [mFLOCSS 書籍](https://zenn.dev/shunei/books/mflocss-design) を参照してください。この starter は仕様を**コードで実証**します。
- **starter 本体へ貢献するときのコード規約**（JS フックの分離・コミットメッセージ規約等）は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。
- 関連リンク（公式サイト / デモサイト / 書籍）は [README.md](./README.md) を参照してください。

## パッケージマネージャー

本 starter は pnpm で開発されており、`pnpm-lock.yaml` が commit されています。エンドユーザーは **npm / pnpm / yarn** のいずれでも動作します:

- 本 README の手順は **npm** で記述（Node.js 同梱ツールのため追加インストール不要）
- `pnpm install` でも動作（付属の `pnpm-lock.yaml` で高速・再現可能インストール）
- `npm install` でも動作（`pnpm-lock.yaml` は無視され、独自に `package-lock.json` がローカル生成される）

### 生成された lockfile の扱い

`npm install` した場合、`package-lock.json` が生成されます。これを commit するかどうかは、あなたのプロジェクトの方針で判断してください（個人プロジェクト・チーム開発では一般的に commit します）。

Starter 開発（Contribute）の場合は pnpm 推奨。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) 参照。

### 脆弱性 pin（npm / pnpm 両系統の同期）

`package.json` の **npm `overrides`** と **`pnpm.overrides`** は同一内容に保ちます（npm は `pnpm.overrides` を読まないため、npm 利用者にも pin を効かせるためのミラー）。

- 脆弱性 pin の **追加・剪定時は両方を同時に更新**してください。片方だけの変更は禁止。
- 純粋なバージョン制約（`">=x.y.z"` 等）は npm / pnpm で同形式互換のため、そのままミラーすれば動作します。
- 同期確認: `npm install --package-lock-only` 後 `npm ls <pkg>` で pin 版に解決されることを検証。

### 剪定 policy（追加と剪定の両輪で運用）

`overrides` は **transitive 依存の脆弱版を強制上書きする「一時的緩和」機構**であり、`dependencies` のような恒久宣言ではありません。**追加だけでなく剪定まで lifecycle として回す**のが健全です。積み上げのみは「誤った安心感 / 監査不能化 / 将来の major 強制 bump 衝突」というアンチパターンを招きます。

剪定の機械判定（dry-run 検証）:

```bash
# pnpm の場合（本 starter の lock を汚さないために /tmp 等で実施）
# 1. 一時コピーで pnpm.overrides を空に or 個別エントリ削除
# 2. lock のみ再解決
pnpm install --lockfile-only
# 3. 脆弱性確認
pnpm audit
# 脆弱性 0 → その override は冗長（latest-satisfying で安全版に解決されている = 剪定可）
# 脆弱性あり → 実効（残す）
```

```bash
# npm の場合
npm install --package-lock-only
npm audit
```

剪定タイミング:

- 依存更新の節目（vite / stylelint / eslint 等の major bump 時）
- 月次など定期 cadence
- Dependabot alert を消化したとき

剪定 commit には **GHSA-ID を残す**（再発時に同 ID で即 re-add 可能、監査性が累積する）:

```
chore(deps): 冗長 override を剪定 — fast-uri / brace-expansion を削除（registry latest が修正版を満たし冗長化、uuid のみ実効維持）
```

参考: 本 starter の [PR #234](https://github.com/mflocss/starter/pull/234)（pnpm.overrides の dry-run 検証 + npm overrides 同期実例）/ [PR #241](https://github.com/mflocss/starter/pull/241)（冗長 override 剪定の実例）。

## GitHub Actions CI

`.github/workflows/check.yml` 参照。Fork / Clone 後は自動 skip（自分のプロジェクトで有効化する場合は `jobs.check.if` 行を削除）。

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

## アセット配置規約

mFLOCSS starter family（static starter / wordpress-starter）共通の配置基準です。

| 対象 | 配置先 | 理由 |
|------|--------|------|
| favicon / OGP / robots.txt / sitemap.xml | `public/` 直下 | ルートパス固定が必要な静的ファイル |
| viewport.js 等の非バンドル JS | `public/assets/scripts/` | `src/assets/scripts/` と階層を対称に揃えつつ非バンドル維持 |
| WP テーマメタファイル（style.css メタ / screenshot.png）| theme root | wordpress-starter のみ該当（静的 starter では不要） |

Vite は `publicDir`（= `public/`）配下のファイルをそのまま `dist/` へコピーします。`public/assets/scripts/` に置くことで `dist/assets/scripts/` に出力され、バンドル対象の `src/assets/scripts/` の出力先と階層が一致します。

## ブレークポイント値の CSS/JS 同期

`public/assets/scripts/viewport.js` の `VIEWPORT_MIN` は、`token/structure.css` の `--viewport-min` と同じ値に合わせてください。この値を変更する場合は両方を更新する必要があります。CSS と JS の基準値を一致させることで、400px 未満の端末でもレイアウト崩れを防ぎ、変更時の修正漏れを防止できます。

## ドロワー（p-drawer / c-overlay）

### HTML 構造

`dialog.p-drawer` は `header` の **兄弟要素**として配置します（header の内側ではない）。`show()` を採用しているため、`[data-drawer-inert]` を持つ要素に JS から `inert` を付与して focus trap を再現します。

```html
<header class="l-header p-header">...</header>
<div class="c-overlay" data-drawer-overlay hidden></div>
<dialog class="p-drawer" id="drawer" data-drawer aria-labelledby="drawer-title" aria-modal="true">
  ...
</dialog>
<main ... data-drawer-inert>...</main>
```

### z-index 設計（starter 固有）

token は `src/assets/css/token/z-index.css` を参照。

starter 固有の設計判断: `--z-header` を `--z-drawer` より前面に置き、ドロワー open 中もハンバーガーボタン（header 内）が常にアクセス可能。

### show() 運用上の SR 実機検証手順

`show()` は `showModal()` の自動 focus trap を持たないため、`inert` + `aria-modal` で同等の挙動を再現できているか実機検証が必要です。

| 環境 | 検証項目 |
|------|---------|
| NVDA + Firefox / Chrome | Browse mode で Tab / 矢印キーが drawer 外に脱出しないこと |
| JAWS + Chrome | Virtual cursor（PC Cursor）で drawer 外要素が読み上げられないこと |
| VoiceOver + Safari (macOS / iOS) | VO + 矢印 / Rotor で drawer 外が読み上げられないこと |

ドロワー open 状態でのチェックリスト:

- [ ] `[data-drawer-inert]` を付与した全要素が SR 読み上げ対象から除外される
- [ ] Tab で drawer 内のフォーカス可能要素のみを巡回する（drawer 外に脱出しない）
- [ ] ハンバーガーボタン（trigger）は inert ではないので Tab で到達して閉じられる
- [ ] Escape キーで close される（JS 実装）
- [ ] `aria-modal="true"` により SR が「ダイアログ」として announce する
- [ ] `aria-labelledby` で参照されるドロワータイトルが SR で読み上げられる

`inert` 属性は WCAG 2.1.1 Keyboard (Level A) と 2.4.3 Focus Order に直結します。新規の自己配置型 Component を追加する際は、必ず `data-drawer-inert` の付与要否を確認してください（後述「data-drawer-inert」節と同じ運用）。

### data-drawer-inert — focus trap 対象マーカー

Drawer open 時に **Drawer 外の全てのフォーカス可能要素を `inert` 化**する必要があります（`dialog.show()` は `showModal()` と異なり自動で inert 化しないため、JS から `setAttribute('inert', '')` で制御）。`data-drawer-inert` は「Drawer open 時に inert 化すべき要素」を明示するマーカー属性です。

#### 付与対象

Drawer と Hamburger トリガー**以外**の、フォーカス可能（= Tab 到達可能）な要素すべて。具体的には:

- `<header>` の子要素（logo リンク・nav 等、ただし hamburger と drawer は除外）
- `<main>` / `<footer>` 等のランドマーク
- `<header>` 外の常駐要素（`c-back-to-top` 等、自己配置型 Component — spec §5.5）
- skip-link（Drawer open 中は到達不要のため）

**新規の自己配置型 Component（例: fixed chat widget、cookie banner 等）を追加する際は、必ず `data-drawer-inert` の付与要否を確認してください。**付与漏れがあると Drawer open 中に Tab が Drawer 外へ脱出し、focus trap が破綻します（WCAG 2.1.1 Keyboard A 違反）。

#### JS 側

`querySelectorAll('[data-drawer-inert]')` で全対象要素を取得 → `openDrawer` で `inert` 属性付与、`closeDrawer` で削除するだけ。新規対象を追加しても JS 側の変更は不要です。
