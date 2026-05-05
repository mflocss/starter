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

エンドユーザー向け手順は [README.md](./README.md) を、運用ルール（パッケージマネージャー / ビルド・納品 / 各種規約）は [CODING_GUIDE.md](./CODING_GUIDE.md) を参照してください。

## 基本フロー

1. Issue で議論（小さい修正は直接 PR でも OK）
2. ブランチ名: `feat/` `fix/` `refactor/` `chore/` `docs/` のいずれか + 短い要約
3. commit message: 詳細は [CODING_GUIDE.md「コミットメッセージ」](./CODING_GUIDE.md#コミットメッセージ) 参照
4. PR 作成前に `pnpm run check` + `pnpm run build` 通過確認
5. PR 作成前に `pnpm run preview` で動作確認（404 ページの fallback 含む。詳細は [CODING_GUIDE.md「404 ページの動作確認」](./CODING_GUIDE.md#404-ページの動作確認) 参照）
6. PR body に変更理由・spec 参照節・動作確認項目を記載

## コード規約

詳細は [CODING_GUIDE.md](./CODING_GUIDE.md) 参照。基本原則:

- mFLOCSS spec § の該当節に準拠
- 既存 Component / Project のパターンを踏襲
- コメント方針は CSS 内コメント / PR body 参照

## リリース時の手順

1. `CHANGELOG.md` の `## [Unreleased]` セクション見出しを `## [x.y.z] - YYYY-MM-DD` に置換（リリース実日付を記入）
2. `## [Unreleased]` セクションをファイル先頭に新設（空の状態で追加）
3. ファイル末尾の link references を更新（`[Unreleased]` の比較 URL と `[x.y.z]` のタグ URL を追加）
4. `git tag vx.y.z` でリリースタグを切る

## 行動規範

本プロジェクトは [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md) を採用します。

## 連絡先

contact@shunei-web.tech
