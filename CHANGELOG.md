# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

CHANGELOG はリリース（version-up）直前に差分をまとめて追記します（運用方針は [CONTRIBUTING.md「リリース時の手順」](./CONTRIBUTING.md#リリース時の手順) 参照）。

## [Unreleased]

## [1.0.4] - 2026-09-16

### Fixed

- `.c-skip-link` の非表示条件と可視化条件のずれを修正。非表示が `:not(:focus, :active, :focus-within)`、可視化が `:focus-visible` で一致しておらず、`:focus` は当たるが `:focus-visible` は当たらないフォーカス（ポインタ経由）ではどちらの規則も適用されず、`position: static` のまま文書先頭にインフローで現れていた。非表示条件を `:not(:focus-visible)` に揃えた
- `vite.config.ts` の `preview-404-fallback` が URL を解決していなかった問題を修正（`pnpm preview` のみに影響し、本番ホスティングの挙動は変わらない）:
  - `..` を含む URL が dist の外を指し、404 フォールバックの判定が dist 外のファイルの有無で変わっていた。参照先が dist の内側に収まる場合だけ存在を見るよう変更
  - percent-encoded な URL を復号していなかったため、日本語ディレクトリ名などのページに対して実在するのに 404.html を返していた
- CI: 新規 advisory により `pnpm audit --audit-level high` が失敗する問題を修正。`fast-uri` の override を `>=3.1.6 <4` へ引き上げ（`nanoid` は override 無しで解消するため追加しない）

## [1.0.3] - 2026-08-04

### Added

- `.p-404__heading` の空ルールセットを追加（HTML のクラスと CSS の 1:1 対応を維持するため）

### Changed

- 依存の override を引き上げ: `brace-expansion` >=5.0.9 / `js-yaml` >=5.2.2 / `fast-uri` >=3.1.5 / `postcss` >=8.5.18 を追加（新規 advisory 対応、pnpm audit 全解消）

## [1.0.2] - 2026-07-17

### Added

- reset に確定的なブラウザ差異（確定罠）の予防を追加:
  - `hr`: UA 既定の罫線色（`color`/`border-color` 依存）を `color: inherit` で是正。`block-size: 0` / `overflow: visible` で UA 既定サイズを是正
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

[Unreleased]: https://github.com/mflocss/starter/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/mflocss/starter/releases/tag/v1.0.4
[1.0.3]: https://github.com/mflocss/starter/releases/tag/v1.0.3
[1.0.2]: https://github.com/mflocss/starter/releases/tag/v1.0.2
[1.0.1]: https://github.com/mflocss/starter/releases/tag/v1.0.1
[1.0.0]: https://github.com/mflocss/starter/releases/tag/v1.0.0
