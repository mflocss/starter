# コーディングガイド

**starter のコードを書く / 拡張する開発者向け**の運用ルールです（mFLOCSS の starter 固有の規約）。
層の定義・命名規則・カスタムプロパティ参照ルール等の仕様は [mFLOCSS 仕様書](https://github.com/mflocss/spec) を参照してください。
関連リンク（公式サイト / デモサイト / 書籍）は [README.md](./README.md) を参照してください。

## ブレークポイント値の CSS/JS 同期

`public/scripts/viewport.js` の `VIEWPORT_MIN` は、`token/structure.css` の `--viewport-min` と同じ値に合わせてください。この値を変更する場合は両方を更新する必要があります。CSS と JS の基準値を一致させることで、400px 未満の端末でもレイアウト崩れを防ぎ、変更時の修正漏れを防止できます。

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
