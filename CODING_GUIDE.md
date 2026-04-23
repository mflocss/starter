# コーディングガイド

このプロジェクトで使用する CSS 設計（mFLOCSS）の starter 固有の運用ルールです。
層の定義・命名規則・カスタムプロパティ参照ルール等の仕様は [mFLOCSS 仕様書](https://mflocss.dev) を参照してください。

## Design Decisions

### mFLOCSS 層アーキテクチャ
`token → reset → foundation → layout → component → project → animation → utility` の順で `@layer` を先制宣言。カスケードの優先順位を明示することで、詳細度に頼らないスタイル管理を実現します。

### 論理プロパティ + 論理 viewport 単位（vi, dvb）
`margin-inline`・`padding-block` などの論理プロパティを全面採用。LTR/RTL どちらの書字方向にも対応できる基盤を持ちます。fluid typography には `vi`（viewport inline）、全高レイアウトには `dvb`（dynamic viewport block）を使用します。

### oklch カラー + 相対カラー関数
カラーパレットをすべて `oklch` で定義。知覚均一な色空間のため、同じ chroma・lightness の操作が直感的に機能します。シャドウには相対カラー関数（`oklch(from var(--_black) l c h / 透明度)`）を使い、基準色からの派生を宣言的に表現しています。

### --px ヘルパー
`--px: calc(1rem / 16)` を定義することで、デザインカンプの px 指定値をそのまま `calc(24 * var(--px))` のように記述でき、rem への手動変換が不要になります。

### アクセシビリティ
ARIA 属性（`aria-label`・`aria-expanded`・`aria-controls` 等）と `translate="no"` をマークアップに明記。視覚的非表示には `visibility: hidden` ではなく `clip-path: inset(50%)` を使い、スクリーンリーダーへの露出を制御しています。

### JS 最小化（:has() + :user-invalid で CSS-only バリデーション）
必須マークの自動付与は `:has(+ :required)` で実装。フォームのバリデーションスタイルは `:user-invalid` で制御し、JS なしで「ユーザー操作後にのみエラーを表示」を実現しています。

### パフォーマンス
ヒーロー画像に `fetchpriority="high"` を付与して LCP を改善。スクロールイベントは `{ passive: true }` で登録し、メインスレッドのブロッキングを回避しています。

## 単位の使い分け

| 単位 | 記法 | 対象 |
|------|------|------|
| **rem** | `calc(N * var(--px))` | フォントサイズ・余白・ヘッダー高さ等、ユーザーのフォント設定に追従すべき値 |
| **px** | `Npx` | 角丸・シャドウ・ボーダー幅・コンテンツ幅上限・タップ領域等、物理的な制約に紐づく値 |

## 流体タイポグラフィ

`typography.css` の `clamp()` 値は viewport 400px〜1440px 間の線形補間で算出しています。値を変更する場合は各変数のコメントにある min/max を調整し、clamp の中間値を再計算してください。ブレークポイントなしで滑らかにスケールするため、メディアクエリの管理コストを削減できます。

### ブレークポイント値の CSS/JS 同期

`public/scripts/viewport.js` の `VIEWPORT_MIN` は、`token/structure.css` の `--viewport-min` と同じ値に合わせてください。この値を変更する場合は両方を更新する必要があります。CSS と JS の基準値を一致させることで、400px 未満の端末でもレイアウト崩れを防ぎ、変更時の修正漏れを防止できます。

## @container vs @media

| 観点 | @container | @media |
|------|-----------|--------|
| 基準 | 親コンテナの幅 | ビューポートの幅 |
| 用途 | コンポーネント単位のレスポンシブ | ページ全体のレイアウト切替 |
| サイズ単位 | `cqi`（container query inline） | `px` / `em` / `rem` |
| この LP での例 | Features セクション内のコンテンツ余白の流体調整 | ヘッダーのナビ表示/非表示 |

`foundation/base.css` の `body` に `container-type: inline-size`（`container-name: page`）を宣言しており、Project/Component 層でクエリを記述します。セクション内部で独立した container を設けたい場合は、当該 Project のコンテナ要素にも `container-type: inline-size` を追加します（例: `p-features.css`、`p-voice.css`）。

## モーションガードのルール

動きを伴うアニメーションは前庭障害を持つユーザーに悪影響を与えることがあります。ガード条件を明確にすることで、アクセシビリティを確保しつつ不要な判断コストを排除できます。

- 色変化のみ（`background-color`, `color` 等）→ ガード不要。前庭障害のトリガーにならないため
- `translate`・`scale`・`rotate` 等の動きを含む → `@media (prefers-reduced-motion: no-preference)` でガード

## data-immediate

CSS 完結のアニメーション。JS を待たず即時再生。LCP 要素（Hero 等）に使用。

```html
<section data-immediate="scale-in">...</section>
```

`data-immediate="アニメーション名"` を付与した要素は JS の `data-visible` を待たずにアニメーションを開始するため、CSS 適用〜JS 実行の間に `opacity: 0` が発生する FOIC（Flash Of Invisible Content）を防止できる。`data-animate` と併用しない（属性名自体が挙動を表す）。

`data-animate="アニメーション名"` は JS 待ちアニメーション。IntersectionObserver が `data-visible` を付与した時点で再生を開始する。スクロールで視界に入った要素に使用。

## ドロワー（p-drawer / c-overlay）

### HTML 構造

`dialog.p-drawer` は `header` の **兄弟要素**として配置します（header の内側ではない）。`showModal()` を使うと header が `::backdrop` の背面に隠れるため、`show()` を使用します。

```html
<header class="l-header p-header">...</header>
<div class="c-overlay" data-drawer-overlay hidden></div>
<dialog class="p-drawer" id="drawer" data-drawer aria-labelledby="drawer-title">
  ...
</dialog>
<main ... data-drawer-inert>...</main>
```

### c-overlay — 汎用 Component

`c-overlay` はドロワー専用ではなくモーダル・ライトボックス等でも再利用可能な Component です。z-index は `--overlay-z` で利用側から注入します（実装詳細は `c-overlay.css` 参照）。

### data-open — 開閉アニメーション制御

`dialog.close()` は即座に `display: none` にするため、CSS transition だけでは閉じるアニメーションが効きません。`data-open` 属性でアニメーション状態を JS から制御します（dialog の `open` 属性とは責務が異なります）。実装詳細は `src/assets/scripts/main.js` を参照してください。

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

## 空のルールセット

HTML のクラスと CSS のルールセットは 1:1 で対応させます。スタイルが不要なクラスでも、ルールセットを残してコメントで意図を示します。「スタイルを意図的に書かなかった」と「書き忘れた」を区別でき、後から読んだコーダーが誤ってスタイルを追加するミスを防止できます。

```css
.p-header__hamburger {
  /* スタイルなし（HTML クラスとの対応を維持） */
}
```

## コミットメッセージ

prefix で変更の種類を明示し、タイトルで変更の影響を日本語で伝えます。git log を一覧したときに「何が変わったか」が即座に分かり、差し戻しや cherry-pick の判断コストを削減できます。

```
<prefix>: 変更内容を日本語で簡潔に
```

### prefix

| prefix | 用途 | 例 |
|--------|------|-----|
| `feat` | 新機能・新コンポーネント追加 | `feat: FAQ セクションにアコーディオンを追加` |
| `fix` | バグ修正・表示崩れ修正 | `fix: SP でハンバーガーメニューが閉じない問題を修正` |
| `refactor` | 動作を変えないコード改善 | `refactor: p-header の CSS 変数をトークン参照に統一` |
| `style` | フォーマット・空白・セミコロン等 | `style: Prettier による自動整形` |
| `docs` | ドキュメントのみの変更 | `docs: README にダークモード無効化手順を追加` |
| `chore` | ビルド・設定・依存関係 | `chore: Stylelint を v17 に更新` |

### ルール

- prefix は英語、タイトルは日本語
- 「何を変えたか」ではなく「何が変わるか」を書く
- 1行目は 72 文字以内を目安に

## 関連リンク

- [デモサイト](https://starter.mflocss.dev) — starter のライブプレビュー
- [そのFLOCSS、なぜそこに書いた？ —— mFLOCSS で迷わない CSS 設計の判断基準](https://zenn.dev/shunei/books/mflocss-design)
- [mFLOCSS 仕様書](https://mflocss.dev)
