# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

## [Unreleased]（v1.0 リリース前）

### Added

- セッション 4（2026-04-23）で確立した設計原則体系
  - Component 使い方の統一原則 13 項 + 例外 A/B/C
  - class 記載順 / HTML 属性順 / CSS 定義順 の 3 順序ルール
  - コメント方針 8 ルール（責任境界: spec / 書籍 / starter）
  - 統一 Block 併記パターン（責任直交合成）
- community health files（CHANGELOG / CONTRIBUTING / SECURITY / CODE_OF_CONDUCT）
- Issue テンプレート（bug report / feature request）
- GitHub Actions CI（本体のみ発動、Fork / Clone 時は自動 skip）

### Changed

- フォームフォーカス指標を `:focus-visible` に変更（WCAG 2.4.11 AA 準拠）
- skip-link の属性順を Google Style に統一（class → data-* → href）
- 404 / privacy の Back-to-Top SVG クラス名を修正（`c-icon` → `c-back-to-top__icon`）
- 同意チェックボックスの構造を `aria-labelledby` パターンに変更（HTML 仕様準拠）
- `<main>` に `tabindex="-1"` を付与（スキップリンク実効性確保）
- 必須マーク・必須説明文を追加（WCAG 3.3.2）

### Removed

- Reset / Foundation 冗長カスケード 8 項目
- `.worker-context.md`（Claude Code 内部コンテキストファイル）

## [1.0.0] - （リリース予定）

初回正式リリース。v0.x 時代の全作業の集大成。
