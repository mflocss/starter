# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

CHANGELOG はリリース（version-up）直前に差分をまとめて追記します（運用方針は [CONTRIBUTING.md「リリース時の手順」](./CONTRIBUTING.md#リリース時の手順) 参照）。

## [1.0.2] - 2026-07-17

### Added

- reset に確定的なブラウザ差異（確定罠）の予防を追加:
  - `hr`: Firefox の罫線色を `color: inherit` で是正（UA 既定の border-color 依存を解消）。`block-size: 0` / `overflow: visible` で UA 既定サイズを是正
  - `sub` / `sup`: `line-height: 0` で行の高さ汚染を是正（位置は論理プロパティ `inset-block-start` / `inset-block-end` で指定）
  - `audio`: `max-inline-size: 100%` / `vertical-align: bottom` を付与（`block-size: auto` は要素が消えるため除外）
  - `:focus-visible`: `outline-offset: 3px` を付与し、`[tabindex="-1"]:focus` の `outline` を抑制（プログラム的フォーカスのリング抑制）
- reset の一部は kiso.css（MIT License, © 2025 Takahiro Arai）に基づく。第三者ライセンスのクレジットを `NOTICE` に明記

## [1.0.1] - 2026-07-17

### Fixed

- CI: `pnpm audit` が npm レジストリの legacy audit endpoint 廃止（2026-07-15）により 410 で失敗する問題を修正。Security audit ステップのみ `pnpm dlx pnpm@11 audit` に切り替え、pnpm v11 の新 bulk advisory endpoint を利用するよう変更

## [1.0.0] - 2026-07-13

初回正式リリース。

### Added

- mFLOCSS 仕様書 v1.0 準拠のリファレンス実装（Vite + Native CSS + Native JS、ビルドレス）
- `@layer` によるカスケード制御（Token / Reset / Foundation / Layout / Component / Project / Animation / Utility）
- モダン CSS 全面採用（論理プロパティ / Container Queries / `:has()` / `oklch()` / `light-dark()` / `clamp()`）
- WCAG 2.2 AA 準拠 + Core Web Vitals 配慮 + Dark mode 対応（`prefers-color-scheme`）
- Community health files + GitHub Actions CI + Issue テンプレート

[1.0.2]: https://github.com/mflocss/starter/releases/tag/v1.0.2
[1.0.1]: https://github.com/mflocss/starter/releases/tag/v1.0.1
[1.0.0]: https://github.com/mflocss/starter/releases/tag/v1.0.0
