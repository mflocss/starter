# AR レポート: fix/remove-theme-color-baseline-failure

- **対象 PR**: fix(starter): theme-color media attribute 削除 (Baseline 未達 + fallback 不能)
- **AR 段階**: B 段階（変更内容の妥当性レビュー）
- **実施日**: 2026-05-19
- **completeness-criteria 観点**: mflocss/starter — Portability / HTML セマンティック / 教材価値

---

## 変更概要

`<meta name="theme-color" media="...">` を `src/*.html` 全 3 ファイルから削除。
関連 CUSTOMIZE コメント（各 1 行）も同時削除。合計 9 行削除。

---

## AR チェック

### 🔴 Critical 観点

| # | 観点 | 結果 | 根拠 |
|---|---|---|---|
| C1 | 削除の妥当性（Baseline 未達確認） | ✅ Pass | Firefox 未対応 / Chrome は PWA インストール時のみ。`media=` 属性の Baseline 状況は Widely Available 非達成 |
| C2 | fallback 不能の確認 | ✅ Pass | `@supports` で条件分岐不可、CSS Custom Property 経由でも制御不能。フォールバック手段なし |
| C3 | 教材価値の判断 | ✅ Pass | 動作確認が Safari macOS/iOS のみ可能 → 汎用教材として機能しない。mFLOCSS thesis（CSS 設計軸）外の要素 |
| C4 | `color-scheme` meta の保持確認 | ✅ Pass | `<meta name="color-scheme" content="light dark" />` は削除対象外で全 3 ファイル保持済み（Baseline 達成済 + fallback 可） |

### 🟢 Essential 観点

| # | 観点 | 結果 | 根拠 |
|---|---|---|---|
| E1 | 削除完全性（src 全 3 ファイル） | ✅ Pass | `grep -rn "theme-color" src/` → 0 件 |
| E2 | dist 反映確認 | ✅ Pass | `pnpm build` 成功 / `grep -rn "theme-color" dist/` → 0 件 |
| E3 | ドキュメント波及なし | ✅ Pass | `*.md` / `*.json` に theme-color 参照なし（grep 確認済） |
| E4 | コメント孤立なし | ✅ Pass | CUSTOMIZE コメントは theme-color 専用説明 → 削除後は意味を失う → 同時削除は正しい判断 |
| E5 | 他 HTML 要素への副作用なし | ✅ Pass | diff 確認: 削除 3 行のみ、隣接要素（`<!-- OGP -->` / `<!-- Styles -->`）正常 |

### 🟠 Guardian 観点

| # | 観点 | 結果 | 根拠 |
|---|---|---|---|
| G1 | 情報公開範囲への影響なし | ✅ Pass | meta 削除のみ、機密情報・個人情報への影響なし |

---

## Finding 一覧

| 重要度 | 内容 | 対応 |
|---|---|---|
| なし | — | — |

**結論: No finding。全観点 Pass。マージ承認可。**

---

## 補足 (Informative)

- `color-scheme` meta は Baseline Widely Available（2021 Baseline）。削除不要、保持が正しい。
- 本変更は cortex book v1.0(new) scope 純化 PR (cortex#862) と連動。book 側から theme-color の記述が外れることへの starter 側整合。
