# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

## [Unreleased] (v1.0 リリース予定)

初回正式リリース。

### Added

- mFLOCSS 仕様書 v1.0 準拠のリファレンス実装（Vite + Native CSS + Native JS、ビルドレス・モダン CSS）
- 8 層の `@layer` 構造（Token / Reset / Foundation / Layout / Component / Project / Animation / Utility）
- Component 使い方の統一原則 13 項 + 例外 A/B/C
- class 記載順 / HTML 属性順 / CSS 定義順 の 3 順序ルール
- 統一 Block 併記パターン（責任直交合成）
- Baseline 2024 対応（論理プロパティ / Container Queries / `:has()` / `@layer` / `oklch()` / `light-dark()` / `clamp()`）
- WCAG 2.2 AA 準拠
- Core Web Vitals 配慮（LCP preload / `fetchpriority` / `prefers-reduced-motion`）
- Dark mode 対応（`prefers-color-scheme`）
- Community health files（CHANGELOG / CONTRIBUTING / SECURITY / CODE_OF_CONDUCT）
- GitHub Actions CI（starter 本体のみ発動、Fork / Clone 時は自動 skip）
- Issue テンプレート（bug report / feature request）

[Unreleased]: https://github.com/mflocss/starter/compare/v1.0.0...HEAD
