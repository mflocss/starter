# コーディングガイド

このプロジェクトで使用する CSS 設計（mFLOCSS）のルールです。

## レイヤー構成

```
token → reset → foundation → layout → component → project → animation → utility
```

| レイヤー | 責任 |
|---------|------|
| Token | デザイン値の定義（色・フォント・余白等） |
| Reset | ブラウザ環境の初期化 |
| Foundation | 要素の基本スタイル（base + form） |
| Layout | 位置と空間の配置 |
| Component | 配置先に左右されない再利用可能なパーツ |
| Project | サイト固有のパーツとデザイン要件 |
| Animation | 装飾的アニメーション |
| Utility | 単一目的のスタイル上書き |

### レイヤー判断フロー

1. デザイントークン（色・フォント・余白の変数）→ **Token**
2. ブラウザリセット → **Reset**
3. 要素セレクタのデフォルト → **Foundation**
4. ページの骨格（セクション幅・コンテナ）→ **Layout**
5. 複数ページで使い回すパーツ → **Component**
6. 特定のページ・機能でしか使わないパーツ → **Project**
7. 装飾的アニメーション（なくても機能する演出）→ **Animation**
8. 上記で対処できない局所的な調整 → **Utility**

### Component の条件

- Portability Test に合格すること（別のページ・プロジェクトに持っていっても壊れない）
- Token 層のセマンティック変数（`--color-*`, `--space-*` 等）のみ参照
- `--_` プレフィックスの内部変数は直接参照しない
- position: fixed/sticky は使わない（Project 層が担当）
- 外部レイアウト（margin, width, position）を自身で持たない

### @container vs @media

| 観点 | @container | @media |
|------|-----------|--------|
| 基準 | 親コンテナの幅 | ビューポートの幅 |
| 用途 | コンポーネント単位のレスポンシブ | ページ全体のレイアウト切替 |
| サイズ単位 | `cqi`（container query inline） | `px` / `em` |
| この LP での例 | Features カード内のレイアウト切替 | ヘッダーのナビ表示/非表示 |

`l-container.css` で `container-type: inline-size` を宣言し、Project/Component 層でクエリを記述します。

## 命名規則

### プレフィックス

| プレフィックス | レイヤー | 例 |
|-------------|---------|-----|
| `l-` | Layout | `l-section`, `l-inner` |
| `c-` | Component | `c-button`, `c-section-heading` |
| `p-` | Project | `p-header`, `p-footer` |
| `u-` | Utility | `u-hidden-sp`, `u-visually-hidden` |

Token, Reset, Foundation, Animation はプレフィックスなし。

### BEM + .-modifier

```
.c-button              → Block
.c-button__icon        → Element
.c-button.-primary     → Modifier（BEM の -- ではなく .- を使用）
```

### 状態クラス

JavaScript で切り替える状態は `.is-*` を使用:

```
.is-visible
.is-loading
```

## モーションガード

| 層 | ガード | 理由 |
|----|--------|------|
| Animation | `(prefers-reduced-motion: no-preference) and (scripting: enabled)` | JS 無効時に要素が不可視になるのを防止 |
| Component / Project | `(prefers-reduced-motion: no-preference)` | 要素は常に可視。滑らかさだけを制御 |

Animation 層は `opacity: 0` 等で初期状態を隠すため、JS が動かないと要素が見えなくなる。Component / Project の transition は状態変化の滑らかさのみで、ガードの有無にかかわらず要素は表示される。

### 1 ガードの対象判断

| transition プロパティ | ガード | 理由 |
|---------------------|--------|------|
| transform（translate / rotate / scale）を含む | 必要 | 前庭障害のトリガーになりうる |
| 色変化（color / border-color / background-color）・opacity のみ | 不要 | 前庭障害のトリガーにならない |

transform を含む transition は `@media (prefers-reduced-motion: no-preference)` で囲み、`reduce` 設定時にモーションを無効化する。色変化のみの transition はガードなしで宣言してよい。

```css
/* ✅ 色変化のみ → ガード不要。前庭障害のトリガーにならないため */
.c-back-to-top {
  transition: background-color var(--duration-fast) var(--ease-out-cubic);
}

/* ✅ translate を含む → ガードが必要 */
.c-button {
  @media (prefers-reduced-motion: no-preference) {
    transition:
      background-color var(--duration-normal) var(--ease-out-cubic),
      translate var(--duration-normal) var(--ease-out-cubic);
  }
}
```

## カスタムプロパティ

### プライベート変数（`--_`）

`--_` プレフィックスの変数はそのブロック内でのみ使用する内部変数です。外部から参照しません。

```css
.c-hamburger {
  --_line-width: 20px;   /* このコンポーネント内でのみ使用 */
  --_line-height: 2px;
}
```

例外: `color.css` 内の `--_` パレット変数は同ファイルのセマンティック変数から参照されます（primitive → semantic 変換）。

### 単位の使い分け

| 単位 | 記法 | 対象 |
|------|------|------|
| **rem** | `calc(N * var(--px))` | フォントサイズ・余白・ヘッダー高さ等、ユーザーのフォント設定に追従すべき値 |
| **px** | `Npx` | 角丸・シャドウ・ボーダー幅・コンテンツ幅上限・タップ領域等、物理的な制約に紐づく値 |

## 流体タイポグラフィ

`typography.css` の `clamp()` 値は viewport-min〜viewport-max 間の直線的な補間で算出しています。

```
preferred = (max - min) / (viewport-max - viewport-min) × 100vi + 切片rem
切片 = min - (max - min) / (viewport-max - viewport-min) × viewport-min
```

例: `--font-size-h1` は 32px → 56px を 400px → 1440px で補間:

```
傾き = (56 - 32) / (1440 - 400) = 0.02308 → 2.308vi
切片 = 32/16 - 0.02308 × 400/16 = 2 - 0.577 = 1.4231rem
→ clamp(calc(32 * var(--px)), 2.308vi + 1.4231rem, calc(56 * var(--px)))
```

## ファイル追加手順

1. 対応するレイヤーのディレクトリに `プレフィックス-名前.css` を作成
2. `style.css` に `@import './ディレクトリ/ファイル名.css' layer(レイヤー名);` を追加

## 空のルールセット

HTML のクラスと CSS のルールセットは 1:1 で対応させます。スタイルが不要なクラスでも、ルールセットを残してコメントで意図を示します。

```css
.p-header__hamburger {
  /* スタイルなし（HTML クラスとの対応を維持） */
}
```

納品前に `CUSTOMIZE` コメントが残っていないことを確認してください。

## コミットメッセージ

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
