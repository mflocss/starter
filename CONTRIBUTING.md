# Contributing to mFLOCSS starter

mFLOCSS starter は mFLOCSS 仕様書（[mflocss/spec](https://github.com/mflocss/spec)）のリファレンス実装です。Issue / PR を歓迎します。

## 受け入れる範囲

- mFLOCSS spec 準拠の CSS 設計 / 実装の改善
- HTML セマンティック / a11y / パフォーマンスの改善
- ドキュメント（README / コード内コメント）の改善
- バグ報告・修正

## 受け入れ外

- mFLOCSS spec 自体の変更提案 → [mflocss/spec](https://github.com/mflocss/spec) の Issue へ
- デモコンテンツ（キャッチコピー / 画像 等）の変更提案（差し替え前提のため）

## 開発環境

### Contributor 向け（starter 本体開発）

本プロジェクトは **pnpm** を使用して開発しています（`pnpm-lock.yaml` commit、CI も pnpm）。

```bash
# pnpm 未インストールの場合: https://pnpm.io/installation
pnpm install
pnpm dev
```

エンドユーザー向け手順は [README.md](./README.md) を、starter を使うときの運用ルール（パッケージマネージャー / ビルド・納品 / アセット配置 / ドロワー運用等）は [CODING_GUIDE.md](./CODING_GUIDE.md) を参照してください。

## 基本フロー

1. Issue で議論（小さい修正は直接 PR でも OK）
2. ブランチ名: `feat/` `fix/` `refactor/` `chore/` `docs/` のいずれか + 短い要約
3. commit message: 下記「[コード規約 > コミットメッセージ](#コミットメッセージ)」の規約に従う
4. PR 作成前に `pnpm run check` + `pnpm run build` 通過確認
5. PR 作成前に `pnpm run preview` で動作確認（404 ページの fallback 含む。詳細は [CODING_GUIDE.md「404 ページの動作確認」](./CODING_GUIDE.md#404-ページの動作確認) 参照）
6. PR body に変更理由・spec 参照節・動作確認項目を記載

## コード規約

starter 本体のコードを書く / 拡張するときの規約です。

### mFLOCSS 準拠

- mFLOCSS spec § の該当節に準拠
- 既存 Component / Project のパターンを踏襲
- コメント方針は [CODING_GUIDE.md「コメント方針」](./CODING_GUIDE.md#コメント方針) 参照

### JS フックの分離

JS で DOM 要素を取得する際は **`data-*` 属性** を使います。スタイルクラス（`c-` / `p-` / `l-` / `u-` プレフィックス）を JS フックに使ってはいけません。

```js
// ✅ data-* 属性で JS フック
document.querySelectorAll('[data-validate]');

// ❌ スタイルクラスを JS フックに使用（禁止）
document.querySelectorAll('.c-form');
```

**理由**: スタイルクラスは CSS 設計の都合で変更・削除されることがあります。JS フックにスタイルクラスを使うと、デザイン変更が JS バグに直結します（スタイルと挙動の結合）。`data-*` 属性はスタイルとは独立しており、HTML の意味を壊さずに JS の選択対象を明示できます。

### コミットメッセージ

prefix で変更の種類を明示し、タイトルで変更の影響を日本語で伝えます。git log を一覧したときに「何が変わったか」が即座に分かり、差し戻しや cherry-pick の判断コストを削減できます。

```
<prefix>: 変更内容を日本語で簡潔に
```

#### prefix

| prefix | 用途 | 例 |
|--------|------|-----|
| `feat` | 新機能・新コンポーネント追加 | `feat: FAQ セクションにアコーディオンを追加` |
| `fix` | バグ修正・表示崩れ修正 | `fix: SP でハンバーガーメニューが閉じない問題を修正` |
| `refactor` | 動作を変えないコード改善 | `refactor: p-header の CSS 変数をトークン参照に統一` |
| `style` | フォーマット・空白・セミコロン等 | `style: Prettier による自動整形` |
| `docs` | ドキュメントのみの変更 | `docs: README にダークモード無効化手順を追加` |
| `chore` | ビルド・設定・依存関係 | `chore: Stylelint を v17 に更新` |

#### ルール

- prefix は英語、タイトルは日本語
- 「何を変えたか」ではなく「何が変わるか」を書く
- 1行目は 72 文字以内を目安に

## リリース時の手順

CHANGELOG は **per-PR で都度更新せず、リリース（version-up）直前に差分をまとめて追記**します（更新の手間と PR ノイズを減らすため）。リリース時に以下を行います:

1. `CHANGELOG.md` の `## [Unreleased]` セクションに、前回リリース以降の差分をまとめて追記
2. `## [Unreleased]` セクション見出しを `## [x.y.z] - YYYY-MM-DD` に置換（リリース実日付を記入）
3. `## [Unreleased]` セクションをファイル先頭に新設（空の状態で追加）
4. ファイル末尾の link references を更新（`[Unreleased]` の比較 URL と `[x.y.z]` のタグ URL を追加）
5. `git tag vx.y.z` でリリースタグを切る

## 行動規範

本プロジェクトは [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md) を採用します。

## 連絡先

contact@shunei-web.tech
