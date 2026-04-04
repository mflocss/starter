# コーディングガイド

このプロジェクトで使用する CSS 設計（mFLOCSS）の starter 固有の運用ルールです。
層の定義・命名規則・カスタムプロパティ参照ルール等の仕様は mFLOCSS spec（§3〜§8）を参照してください。

## レイヤー運用

層の構成・責任・判断フローは spec §3、各層の詳細は spec §5 を参照。

### @container vs @media

| 観点 | @container | @media |
|------|-----------|--------|
| 基準 | 親コンテナの幅 | ビューポートの幅 |
| 用途 | コンポーネント単位のレスポンシブ | ページ全体のレイアウト切替 |
| サイズ単位 | `cqi`（container query inline） | `px` / `em` |
| この LP での例 | Features カード内のレイアウト切替 | ヘッダーのナビ表示/非表示 |

`l-container.css` で `container-type: inline-size` を宣言し、Project/Component 層でクエリを記述します。

## 命名規則

プレフィックス・クラス名の形式・Modifier（`.-xxx`）・State（`data-*` / ARIA 属性）は spec §6 を参照。

## モーションガード

モーションガードの仕様（2 ガード原則・Animation 層と機能的トランジションの区別）は spec §5.7 を参照。

### 1 ガードの対象判断

Component / Project の機能的トランジションにガードを適用するかどうかの基準（spec §5.7 SHOULD）:

| transition プロパティ | ガード | 理由 |
|---------------------|--------|------|
| transform（translate / rotate / scale）を含む | 必要 | 前庭障害のトリガーになりうる |
| 色変化（color / border-color / background-color）・opacity のみ | 不要 | 前庭障害のトリガーにならない |

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

カスタムプロパティの命名規則・参照ルール（セマンティック変数経由・プリミティブ変数の直接参照禁止等）は spec §6〜§7 を参照。

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

## data-immediate

CSS 完結のアニメーション。JS を待たず即時再生。LCP 要素（Hero 等）に使用。

```html
<section data-immediate="scale-in">...</section>
```

`data-immediate="アニメーション名"` を付与した要素は JS の `data-visible` を待たずにアニメーションを開始するため、CSS 適用〜JS 実行の間に `opacity: 0` が発生する FOIC（Flash Of Invisible Content）を防止できる。`data-animate` と併用しない（属性名自体が挙動を表す）。

`data-animate="アニメーション名"` は JS 待ちアニメーション。IntersectionObserver が `data-visible` を付与した時点で再生を開始する。スクロールで視界に入った要素に使用。

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
