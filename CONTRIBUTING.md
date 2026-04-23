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

```bash
npm install
npm run dev
```

Node.js LTS 以降を推奨。

## 基本フロー

1. Issue で議論（小さい修正は直接 PR でも OK）
2. ブランチ名: `feat/` `fix/` `refactor/` `chore/` `docs/` のいずれか + 短い要約
3. commit message: `type(scope): subject`（日本語 OK、例: `fix(c-form): focus-visible でリング温存`）
4. PR 作成前に `npm run check` + `npm run build` 通過確認
5. PR body に変更理由・spec 参照節・動作確認項目を記載

## コード規約

- spec § の該当節に準拠すること
- 既存 Component / Project のパターンを踏襲
- コメント方針は CSS 内コメント / PR body 参照

## 行動規範

本プロジェクトは [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md) を採用します。

## 連絡先

contact@shunei-web.tech
