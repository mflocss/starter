# Changelog

mFLOCSS starter の変更履歴。[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式に準拠し、[Semantic Versioning](https://semver.org/lang/ja/) に従う。

CHANGELOG はリリース（version-up）直前に差分をまとめて追記します（運用方針は [CONTRIBUTING.md「リリース時の手順」](./CONTRIBUTING.md#リリース時の手順) 参照）。

## [Unreleased]

## [1.0.5] - 2026-09-16

### Changed

- **BREAKING**: 実行環境の下限を `package.json` の `engines` で宣言。**Node.js v24 以降**（markuplint 5 の要求）と **pnpm 10.5.1 以降**（pnpm 側の設定の移動先である `pnpm-workspace.yaml` を読むのがこのバージョン以降のため）が必須。pnpm 10.4.1 以前 / pnpm 9 は `pnpm-workspace.yaml` を解釈できず `ERROR packages field missing or empty` で止まります（npm / yarn 利用者は影響なし）
- pnpm 側の `overrides` と `minimum-release-age` の除外リストを、`package.json` の `pnpm` フィールドと `.npmrc` から **`pnpm-workspace.yaml`** へ移動。pnpm 11 が前者を読まなくなり、そのままでは override が黙って外れて対策済みの advisory が戻るため
- 依存を更新: markuplint 4.18.1 → 5.0.0 / vite 8.0.16 → 8.3.0 / eslint 10.2.1 → 10.10.0 / stylelint 17.9.0 → 17.15.0 / prettier 3.8.3 → 3.9.6 / globals 17.5.0 → 17.12.0 / stylelint-config-recess-order 7.7.0 → 7.8.0 / @types/node 25.6.0 → 24.13.4（`.nvmrc` の Node 24 と系列を揃えるためのダウングレード）
- `markuplint.config.cjs` を markuplint 5 に追従: `required-attr` → `require-attr` の改名、新規規則 `performance/head-element-order`（meta 同士の並び順チェックのみ無効化）と `a11y/wai-aria/presentational-children`（`[aria-hidden="true"]` を免除）への対応
- `vite.config.ts` の `__dirname` を `import.meta.dirname` に置換（vite 8.3 が `configLoader: 'native'` で `__dirname` を未対応として警告するため）
- ドキュメント: CODING_GUIDE に pnpm 設定・markuplint 設定のメンテナンス手順と、override 剪定 dry-run の環境依存に関する注意を追記。CONTRIBUTING のリリース手順に剪定 dry-run を追加

### Security

- `image-size` の override を追加（`>=2.0.3 <3`）。markuplint 5 が推移的に持ち込む 2.0.2 に高深刻度の advisory が 2 件（[GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) / [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq)）あるため

### Removed

- 冗長になった override を削除: `uuid` / `js-yaml` / `brace-expansion` / `fast-uri` / `postcss`。いずれも registry の latest-satisfying が修正版を満たすため（override を外した dry-run で `pnpm audit` 全レベル 0 件を確認）

## [1.0.4] - 2026-09-16

### Fixed

- `.c-skip-link`: ポインタ経由のフォーカスで非表示・可視化のどちらの規則も適用されず、インフローで現れていた問題を修正（非表示条件を `:not(:focus-visible)` に統一）
- `preview-404-fallback`（`pnpm preview` のみ）: `..` を含む URL が dist の外を参照していた問題と、percent-encoded な URL を復号せず実在するページに 404.html を返していた問題を修正
- CI: `fast-uri` の override を `>=3.1.6 <4` へ引き上げ（新規 advisory で `pnpm audit --audit-level high` が失敗していた）

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

[Unreleased]: https://github.com/mflocss/starter/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/mflocss/starter/releases/tag/v1.0.5
[1.0.4]: https://github.com/mflocss/starter/releases/tag/v1.0.4
[1.0.3]: https://github.com/mflocss/starter/releases/tag/v1.0.3
[1.0.2]: https://github.com/mflocss/starter/releases/tag/v1.0.2
[1.0.1]: https://github.com/mflocss/starter/releases/tag/v1.0.1
[1.0.0]: https://github.com/mflocss/starter/releases/tag/v1.0.0
