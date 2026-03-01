# コーディングガイド

このプロジェクトで使用する CSS 設計（mFLOCSS）のルールです。

## 命名規則

### プレフィックス

| プレフィックス | レイヤー | 例 |
|-------------|---------|-----|
| `l-` | Layout | `l-section`, `l-section__inner` |
| `c-` | Component | `c-button-cta`, `c-section-heading` |
| `p-` | Project | `p-header`, `p-footer` |
| `a-` | Animation | `a-fade-in-activate` |
| `u-` | Utility | `u-hidden-sp`, `u-visually-hidden` |

### BEM + .-modifier

```
.c-button-cta           → Block
.c-button-cta__icon      → Element
.c-button-cta.-large     → Modifier（BEM の -- ではなく .- を使用）
```

### 状態クラス

JavaScript で切り替える状態は `.is-*` を使用:

```
.is-active
.is-open
.is-hidden
```

## レイヤー判断フロー

1. デザイントークン（色・フォント・余白の変数）→ **Variable**
2. リセット・要素セレクタのデフォルト → **Foundation**
3. ページの骨格（ヘッダー・フッター・セクション幅） → **Layout**
4. 複数ページで使い回すパーツ → **Component**
5. 特定のページ・機能でしか使わないパーツ → **Project**
6. スクロールアニメーション・トランジション → **Animation**
7. 上記で対処できない局所的な調整 → **Utility**

## ファイル追加手順

1. 対応するレイヤーのディレクトリに `プレフィックス-名前.css` を作成
2. `@layer レイヤー名 { }` で囲んで記述
3. `src/css/style.css` に `@import` で追加

## コミットメッセージ

```
feat: 日本語でタイトルを書く
fix: 日本語で修正内容を書く
```

prefix は英語、タイトル・本文は日本語。
