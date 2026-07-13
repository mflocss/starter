# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

CHANGELOG はリリース（version-up）直前に差分をまとめて追記します（運用方針は [CONTRIBUTING.md「リリース時の手順」](./CONTRIBUTING.md#リリース時の手順) 参照）。

## [1.0.0] - 2026-07-13

初回正式リリース。

### Added

- mFLOCSS 仕様書 v1.0 準拠のリファレンス実装（Vite + Native CSS + Native JS、ビルドレス）
- `@layer` によるカスケード制御（Token / Reset / Foundation / Layout / Component / Project / Animation / Utility）
- モダン CSS 全面採用（論理プロパティ / Container Queries / `:has()` / `oklch()` / `light-dark()` / `clamp()`）
- WCAG 2.2 AA 準拠 + Core Web Vitals 配慮 + Dark mode 対応（`prefers-color-scheme`）
- Community health files + GitHub Actions CI + Issue テンプレート

[1.0.0]: https://github.com/mflocss/starter/releases/tag/v1.0.0
