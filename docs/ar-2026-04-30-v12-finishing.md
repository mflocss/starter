# AR レポート: starter v1.2 仕上げ AR 残観点 5 種

**日付**: 2026-04-30  
**対象ブランチ**: `ar/v1.2-finishing-session31`（v1.2 ベース）  
**前回停止地点**: agent#3 (a41fcaab0b050fdc1) が公開 API 命名チェック途中で停止（session 30）  
**検証者**: QA エンジニアエージェント（session31 独立 worktree）

---

## 結果サマリ

| 観点 | Critical | Major | Minor | 計 |
|---|---|---|---|---|
| 1. 公開 API 命名 | 0 | 0 | 2 | 2 |
| 2. spec v1.0 整合 | 0 | 0 | 0 | 0 |
| 3. a11y | 0 | 0 | 1 | 1 |
| 4. HTML マークアップ | 0 | 0 | 4 | 4 |
| 5. CSS 設計 + CODING_GUIDE 整合 | 0 | 0 | 1 | 1 |
| **合計** | **0** | **0** | **8** | **8** |

**ブロッカー判定:**
- v1.0 リリース ブロッカー: **なし**
- wp-starter#8 反映ブロッカー: **なし**

**修正コミット:**
- Critical 修正済: 0 件（Critical 指摘なし）
- Minor 修正未実施: 8 件（別 PR / 後日対応推奨）

---

## 観点 1: 公開 API 命名

### 検証対象と手法

全 Component / Project の Custom Property 命名を Z パターン整合形（`--<block>-<descriptor>` → `--_<prop>: var(--<block>-<descriptor>, <default>)` alias）で機械検証。

### Pass 確認済みコンポーネント

| Block | 公開 API | Z パターン |
|---|---|---|
| `c-button` | `--button-color`, `--button-bg-color`, `--button-border-color`, `--button-hover-bg-color` | ✅ |
| `c-card` | `--card-padding`, `--card-bg`, `--card-radius`, `--card-shadow`, `--card-border` | ✅ |
| `c-form` | `--form-actions-margin-top`, `--form-required-mark`, `--form-link-color` | ✅ |
| `c-icon-button` | `--icon-button-color`, `--icon-button-bg-color`, `--icon-button-border-color`, `--icon-button-hover-bg-color` | ✅ |
| `c-media-split` | `--media-split-first-order` | ✅ |
| `c-overlay` | `--overlay-z` | ✅ |
| `c-prose` | `--prose-max-inline-size` | ✅ |
| `c-text-block` | `--text-block-title-max-inline-size` | ✅ |

Modifier での `--_*` 再 alias（`c-button.-ghost`, `c-card.-subtle`）もすべて正当パターン（デフォルト値変更 + 外部 override 受容）。

Project 層からの公開 API 利用パターン（§5.6 3 パターン）:
- `p-cta`: `--text-block-title-max-inline-size: 600px` → 型 1 公開 API override ✅
- `p-hero__sub-cta`: `--button-color`, `--button-border-color` → 型 1 ✅
- `p-features__item:nth-child(even) .p-features__card`: `--media-split-first-order: 2` → 型 1 ✅
- `[data-drawer-overlay]`: `--overlay-z: calc(var(--z-drawer) - 1)` → 型 1 ✅
- `p-contact__form`: `--form-link-color: var(--color-main)` → 型 1 ✅

### Minor 指摘

#### M1-1: `l-section.css` — `--section-padding-min/max` が Z パターン命名不準拠

**ファイル**: `src/assets/css/layout/l-section.css`

```css
.l-section {
  --section-padding-min: var(--section-standard-min);  /* Z パターンなら --l-section-padding-min */
  --section-padding-max: var(--section-standard-max);
  padding-block: clamp(var(--section-padding-min), ...);
}
```

Project ファイル（`p-numbers.css`, `p-cta.css` 等）が `--section-padding-min/max` を設定することで `l-section` の動作を制御している。Z パターンでは Layout Block `l-section` の公開 API 名は `--l-section-padding-min/max` であるべき。

- 機能上の問題なし
- 意図的 "context token" 設計の可能性あり（Token 層の `--section-*-min/max` を中継するレイヤー境界トークンとして設計）
- 対応方針はしゅんえい判断推奨（命名変更は全 Project ファイルの一括変更を伴う）

#### M1-2: `l-section.css` — 公開 API コメントブロック欠落

`c-*` Component と異なり、`l-section.css` には公開 API（`--section-padding-min/max`）のドキュメントコメントがない。CODING_GUIDE の記述と合わせてコメント追加を推奨。

---

## 観点 2: spec v1.0 整合

### §3 層構造

`layer-order.css`: `@layer token, reset, foundation, layout, component, project, animation, utility;`  
spec §3 の 8 層定義と完全一致。✅

`style.css` の import 順も層順と整合。✅

### §5.5 overflow 判断（4 例確認）

| コンポーネント | overflow の扱い | 判定 |
|---|---|---|
| `c-card` | `overflow` なし（`box-shadow` を clip しない） | ✅ spec 準拠 |
| `c-accordion` | `overflow: hidden`（border-radius 視覚整合のみ、子 shadow 影響なし） | ✅ 許容（自己装飾目的） |
| モーダル相当 | `dialog` element は `c-overlay` + `p-drawer` で分離実装 | ✅ |
| テーブル | `p-pricing__table-wrapper` で `overflow-x: auto`（Project 層で制御） | ✅ spec 準拠 |

`c-back-to-top`, `c-overlay`, `c-skip-link` はすべて `DEVIATION` コメント付きで `position: fixed` を正当化。✅

### §5.6 Project 上書き 3 パターン

上記「観点 1」で確認済み。全 5 箇所が型 1（公開 API override）として正しく実装。✅

### §6 命名規則

- Block: 小文字ハイフン区切り ✅
- Element: `__` 区切り ✅
- Modifier: 単一ハイフンプレフィックス (`-ghost`, `-large`, `-subtle`, `-accent`) ✅
- State: `data-*` 属性パターン (`data-open`, `data-visible`, `data-loading`) ✅

### §7 公開 API

全 Component の公開 API は `--<block>-<descriptor>` 形式準拠（詳細は観点 1 参照）。✅

**spec v1.0 整合: 指摘なし**

---

## 観点 3: アクセシビリティ（a11y）

### Pass 確認済み項目

| 項目 | 確認内容 | 結果 |
|---|---|---|
| ランドマーク | `header`, `nav × 3`, `main`, `footer` + `aria-label` | ✅ |
| スキップリンク | `c-skip-link` → `#main[tabindex="-1"]` | ✅ |
| h1 階層 | 全ページ h1 → h2 → h3 正順 | ✅ |
| フォームラベル | 全入力に `<label for="">` 対応 | ✅ |
| fieldset/legend | radio グループに `<fieldset>` + `<legend>` | ✅ |
| dialog 管理 | `aria-labelledby` + `aria-modal="true"` + `inert` 制御 | ✅ |
| Escape キー | `show()` 採用のため手動 keydown リスナー実装 | ✅ |
| focus 管理 | Drawer open → 最初のリンクへ、close → hamburger へ返却 | ✅ |
| SVG aria-hidden | 装飾 SVG 全件に `aria-hidden="true"` | ✅ |
| alt テキスト | 情報画像は説明的 alt、装飾画像 (avatar) は `alt=""` | ✅ |
| prefers-reduced-motion | 全 translate/scale/rotate アニメーションでガード済み | ✅ |
| 色変化 transition | CODING_GUIDE 「色変化のみはガード不要」に準拠 | ✅ |
| lang 属性 | `<html lang="ja">` + 英語部分に `lang="en"` | ✅ |
| カラーコントラスト | `--color-text-light` ライト約 7.1:1 / ダーク約 5.0:1 | ✅ |
| タップターゲット | `--size-tap-target: 44px` を nav-link, hamburger, back-to-top に適用 | ✅ |
| フォーカス表示 | foundation 層 `:where(:focus-visible)` で全体適用 | ✅ |

### Minor 指摘

#### M3-1: `c-form__note` の `<span>*</span>` — `aria-hidden="true"` 欠落

**ファイル**: `src/index.html` L623

```html
<!-- 現在 -->
<p class="c-form__note"><span>*</span> のついた項目は必須です</p>

<!-- 推奨 -->
<p class="c-form__note"><span aria-hidden="true">*</span> のついた項目は必須です</p>
```

CSS `::after { content: var(--form-required-mark, '*') }` で各必須フィールドラベルにも `*` が追加される。ノート中の `*` は視覚的参照のための装飾文字であり、`aria-hidden="true"` 付与でスクリーンリーダーの "アスタリスク" 読み上げを除去することで文章の可読性が向上する。

機能上の問題なし、WCAG 達成基準違反ではないが WCAG 3.3.2 Labels or Instructions のベストプラクティス改善。

---

## 観点 4: HTML マークアップ

### Pass 確認済み項目

| 項目 | 確認内容 | 結果 |
|---|---|---|
| セマンティック HTML | section/article/figure/figcaption/blockquote/cite/address/details/summary 適切使用 | ✅ |
| hgroup | eyebrow + h2 ペアに適切使用 | ✅ |
| title / description | 全 3 ページ設定済み | ✅ |
| canonical | index.html / privacy/index.html 設定済み、404.html 意図的未設定 | ✅ |
| robots noindex | 404.html に `content="noindex,follow"` | ✅ |
| OGP | index.html / privacy/index.html に og:* + twitter:* | ✅ |
| 構造化データ | Organization + LocalBusiness + WebSite + FAQPage（index.html）, BreadcrumbList（privacy） | ✅ |
| LCP 画像 | `<link rel="preload">` + `fetchpriority="high"` + `loading="eager"` | ✅ |
| 非 LCP 画像 | `loading="lazy"` + `decoding="async"` | ✅ |
| module script | `<script type="module">` — defer 相当 | ✅ |
| viewport.js blocking | head 内 blocking 実行（CODING_GUIDE 説明通り意図的） | ✅ |
| color-scheme meta | light dark 両対応 | ✅ |
| theme-color meta | light/dark 各メインカラー指定 | ✅ |
| table scope | `scope="col"` / `scope="row"` 設定済み | ✅ |
| table caption | `<caption class="u-visually-hidden">` でスクリーンリーダー向け説明 | ✅ |
| 料金表 scrollable region | `tabindex="0"` + `role="region"` + `aria-label` | ✅ |

### Minor 指摘（HTML 属性順違反 4 件）

PR #167 で `<a>` タグの HTML 属性順（class-first）修正が完了したが、`<h1>` / `<span>` 要素の修正が漏れた。

#### M4-1: `404.html` L69 — `<span id-first>`

```html
<!-- 現在 (id-first 違反) -->
<span id="drawer-title" class="u-visually-hidden">ナビゲーションメニュー</span>

<!-- 正 (class-first) -->
<span class="u-visually-hidden" id="drawer-title">ナビゲーションメニュー</span>
```

#### M4-2: `404.html` L95 — `<h1 id-first>`

```html
<!-- 現在 (id-first 違反) -->
<h1 id="not-found-heading" class="c-section-heading__title">ページが見つかりません</h1>

<!-- 正 (class-first) -->
<h1 class="c-section-heading__title" id="not-found-heading">ページが見つかりません</h1>
```

#### M4-3: `privacy/index.html` L109 — `<span id-first>`

```html
<!-- 現在 (id-first 違反) -->
<span id="drawer-title" class="u-visually-hidden">ナビゲーションメニュー</span>

<!-- 正 (class-first) -->
<span class="u-visually-hidden" id="drawer-title">ナビゲーションメニュー</span>
```

#### M4-4: `privacy/index.html` L134 — `<h1 id-first>`

```html
<!-- 現在 (id-first 違反) -->
<h1 id="privacy-heading" class="p-privacy__title">プライバシーポリシー</h1>

<!-- 正 (class-first) -->
<h1 class="p-privacy__title" id="privacy-heading">プライバシーポリシー</h1>
```

PR #167 と同一の違反パターン。別 PR（PR #167 フォローアップ）として修正推奨。

---

## 観点 5: CSS 設計 + CODING_GUIDE 整合

### Pass 確認済み項目

| 項目 | 確認内容 | 結果 |
|---|---|---|
| @layer 先制宣言 | `layer-order.css` で 8 層先制宣言 | ✅ |
| Custom Properties 命名 | Token `--color-*`, 公開 API `--<block>-*`, 内部 `--_*` | ✅ |
| プレフィックス | c-/p-/l-/u-/animation ファイル名 | ✅ |
| コメント方針 | 公開 API comment / DEVIATION comment / スタイルなし comment | ✅ |
| Reset 冗長 override | 重複定義なし | ✅ |
| `c-button.-ghost` Modifier | `--_*` alias 再定義でデフォルト変更（正当パターン） | ✅ |
| `c-card.-subtle` Modifier | 同上 | ✅ |
| モーションガード | 動き系は全件 `prefers-reduced-motion: no-preference` | ✅ |
| 色変化 transition | `p-footer__nav-link` 等はガードなし（CODING_GUIDE 準拠） | ✅ |
| `@container` vs `@media` | コンポーネント単位は container、ページ全体は media | ✅ |
| Animation 層 | `scripting: enabled` + `prefers-reduced-motion` 二重ガード | ✅ |
| CODING_GUIDE drawer 記述 | `show()` 採用根拠 / inert 制御 / `data-open` 制御 と実装一致 | ✅ |

### Minor 指摘

#### M5-1: `p-flow__item` + `c-text-block` Block 組み合わせ — `display` 責任重複

**ファイル**: `src/assets/css/project/p-flow.css` + `src/assets/css/component/c-text-block.css`

```html
<li class="c-card -subtle c-text-block p-flow__item">
```

- `c-text-block` が `display: flex; flex-direction: column; gap: var(--space-sm)` を Component 層で設定
- `p-flow__item` が `display: grid; gap: var(--space-sm) var(--space-lg)` を Project 層で設定（上書き）

Project 層カスケード優先により `c-text-block` の `display: flex` は dead code になる。`c-text-block` の gap も grid の row-gap に置き換えられ実質的に無効。

機能上の問題なし（grid の row-gap = `--space-sm` が flex の gap と同値のため視覚的結果は同一）。Block 組み合わせの責任境界ドキュメントへの追記を推奨（`p-flow__item` コメントに「`c-text-block` の display/gap を override する意図」を記載）。

---

## 検証詳細メモ

### c-icon-button と c-button の冗長性について

`c-icon-button` は `c-button` とほぼ同一のロジックを持つが、Block 名・公開 API 名前空間が独立しており（`--icon-button-*` vs `--button-*`）、spec 上は正当な別 Block 設計。メンテナンスコストは増加するが、設計意図として分離されている。指摘なし。

### p-drawer.css の `[data-drawer-overlay]` セレクタについて

属性セレクタ `[data-drawer-overlay]` で `c-overlay` の公開 API を Project 層から設定するパターン。`p-*` Block 内の要素でなくシブリング要素への設定だが、Project 層のカスタマイズとして許容範囲。`[data-*]` セレクタは意味的明確さを持ち、指摘なし。

### `l-section` の `--section-padding-min/max` 命名（詳細）

現状: Layout Block `l-section` のカスタマイズ変数が Token 層変数名(`--section-*`)と重複する命名空間を使用。

設計上の意図として考えられる解釈:
1. **Token として扱う**: Token 層の `--section-*` を Layout 層が直接読む "context token" パターン（Z パターン外）
2. **公開 API として扱う**: `--l-section-padding-min/max` とすべき（Z パターン準拠、全 Project ファイルの変更が必要）

どちらの解釈も機能上は正しく動作する。命名変更の影響範囲が広いため、しゅんえい判断推奨。

---

## 参照ファイル一覧

- `src/assets/css/layer-order.css` — @layer 先制宣言
- `src/assets/css/style.css` — import 順
- `src/assets/css/token/*.css` — Token 層全 9 ファイル
- `src/assets/css/reset/reset.css`
- `src/assets/css/foundation/base.css`, `form.css`
- `src/assets/css/layout/l-*.css` — 全 4 ファイル
- `src/assets/css/component/c-*.css` — 全 17 ファイル
- `src/assets/css/project/p-*.css` — 全 15 ファイル
- `src/assets/css/animation/*.css` — 全 2 ファイル
- `src/assets/css/utility/u-hidden.css`
- `src/index.html`, `src/404.html`, `src/privacy/index.html`
- `src/assets/scripts/main.js`, `public/scripts/viewport.js`
- `CODING_GUIDE.md`
