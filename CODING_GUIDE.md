# コーディングガイド

この starter を**使う（ビルド・カスタマイズ・メンテナンス・デプロイ）ときの運用ガイド**です。mFLOCSS 仕様書 v1.0 準拠のリファレンス実装として、パッケージ管理・CI・ビルド・アセット配置・コンポーネント運用の勘所をまとめています。

- **mFLOCSS の設計そのもの**（層の定義・命名規則・カスタムプロパティ参照ルール等）は [mFLOCSS 仕様書](https://github.com/mflocss/spec) と [mFLOCSS 書籍](https://zenn.dev/shunei/books/mflocss-design) を参照してください。この starter は仕様を**コードで実証**します。
- **starter 本体へ貢献するときのコード規約**（JS フックの分離・コミットメッセージ規約等）は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。
- 関連リンク（公式サイト / デモサイト / 書籍）は [README.md](./README.md) を参照してください。

## パッケージマネージャー

本 starter は pnpm で開発されており、`pnpm-lock.yaml` が commit されています。エンドユーザーは **npm / pnpm / yarn** のいずれでも動作します:

- 本 README の手順は **npm** で記述（Node.js 同梱ツールのため追加インストール不要）
- `pnpm install` でも動作（付属の `pnpm-lock.yaml` で高速・再現可能インストール）。**pnpm は 10.5.1 以降が必要**です（詳細は下記「[脆弱性 pin](#脆弱性-pinnpm--pnpm-両系統の同期)」）
- `npm install` でも動作（`pnpm-lock.yaml` は無視され、独自に `package-lock.json` がローカル生成される）
- **yarn では脆弱性 pin が効きません** — yarn は `overrides` も `pnpm-workspace.yaml` も読まず、推移的依存の強制には `resolutions` を使います。yarn を使う場合は下記の pin 内容を `resolutions` に書き写してください

Node.js は **v24 以降**が必要です（`package.json` の `engines` で宣言）。

### 生成された lockfile の扱い

`npm install` した場合、`package-lock.json` が生成されます。これを commit するかどうかは、あなたのプロジェクトの方針で判断してください（個人プロジェクト・チーム開発では一般的に commit します）。

Starter 開発（Contribute）の場合は pnpm 推奨。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) 参照。

### 脆弱性 pin（npm / pnpm 両系統の同期）

`package.json` の **npm `overrides`** と `pnpm-workspace.yaml` の **`overrides`** は同一内容に保ちます（npm は `pnpm-workspace.yaml` を読まないため、npm 利用者にも pin を効かせるためのミラー）。

pnpm 側の override の置き場は **`pnpm-workspace.yaml`** です。pnpm 10.5.1 以降がこのファイルを読み、pnpm 11 以降は `package.json` の `pnpm` フィールドと `.npmrc` の pnpm 専用キーを読みません。そこに override を書いたままだと、`--frozen-lockfile` では `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` で落ち、**frozen でない通常の `pnpm install` では警告 1 行だけ出て黙って無効化**され、対策済みの advisory が戻ります。

- 脆弱性 pin の **追加・剪定時は両方を同時に更新**してください。片方だけの変更は禁止。
- 純粋なバージョン制約（`">=x.y.z"` 等）は npm / pnpm で同形式互換のため、そのままミラーすれば動作します。
- 同期確認: `npm install --package-lock-only` 後 `npm ls <pkg>` で pin 版に解決されることを検証。

### 剪定 policy（追加と剪定の両輪で運用）

`overrides` は **transitive 依存の脆弱版を強制上書きする「一時的緩和」機構**であり、`dependencies` のような恒久宣言ではありません。**追加だけでなく剪定まで lifecycle として回す**のが健全です。積み上げのみは「誤った安心感 / 監査不能化 / 将来の major 強制 bump 衝突」というアンチパターンを招きます。

剪定の機械判定（dry-run 検証）:

🔴 **dry-run は実行環境を固定してから回してください。**`minimum-release-age`（公開直後のパッケージを避ける設定）が有効な環境と無効な環境とで、同じ手順が**逆の結論**を返します。修正版が公開直後だと、遅延が有効な環境では安全版に解決できず「実効」、無効な環境では「冗長」と出ます。判定は**遅延を無効にした状態**を基準にし、遅延を使う環境向けの評価は別に行ってください。

```bash
# pnpm の場合（本 starter の lock を汚さないために /tmp 等で実施）
# 1. 一時コピーで pnpm-workspace.yaml の overrides を空に or 個別エントリ削除
# 2. lock のみ再解決（--config.minimum-release-age=0 で環境差を打ち消す）
pnpm install --lockfile-only --config.minimum-release-age=0
# 3. 脆弱性確認
pnpm audit
# 脆弱性 0 → その override は冗長（latest-satisfying で安全版に解決されている = 剪定可）
# 脆弱性あり → 実効（残す）
```

```bash
# npm の場合
npm install --package-lock-only
npm audit
```

🔴 **例外: advisory の floor 版（`patched` 版）が、リポの直接依存のうち最も新しいものより後に公開されている場合は、dry-run が「冗長」と出ても override を残します。**

`minimum-release-age` を有効にした環境では、その floor だけが弾かれて一段下の脆弱版に解決する窓が実在するためです。逆に floor 版のほうが古ければ、その窓に入るほどの遅延は先に直接依存自身を弾いて install を止めるので（`ERR_PNPM_NO_MATURE_MATCHING_VERSION`）、窓は開きません。⚠️ `minimumReleaseAgeExclude` に直接依存を入れると、この保護は外れます。

⚠️ **この保護の形は「安全版に解決する」ではなく「install を止める」です。**遅延環境では floor 版も弾かれるため、`ERR_PNPM_NO_MATURE_MATCHING_VERSION` で install がハードエラーになります（脆弱版に落ちる前に止まる = 意図した挙動）。floor 版の公開から遅延日数が経てば解消します。

剪定タイミング:

- 依存更新の節目（vite / stylelint / eslint / markuplint 等の major bump 時）
- 月次など定期 cadence
- Dependabot alert を消化したとき

剪定 commit には **GHSA-ID を残す**（再発時に同 ID で即 re-add 可能、監査性が累積する）:

```
chore(deps): 冗長 override を剪定 — fast-uri / brace-expansion を削除（registry latest が修正版を満たし冗長化、uuid のみ実効維持）
```

参考: 本 starter の [PR #234](https://github.com/mflocss/starter/pull/234)（pnpm 側 override の dry-run 検証 + npm overrides 同期実例）/ [PR #241](https://github.com/mflocss/starter/pull/241)（冗長 override 剪定の実例）。

## pnpm 設定のメンテナンス

`pnpm-workspace.yaml` の `minimumReleaseAgeExclude` は rolldown（vite の依存）の閉包を列挙したものです。rolldown は対象を `dependencies` と `optionalDependencies` の**両方**に持つので、手で突き合わせると取りこぼします。

🔴 **rolldown を更新したら、リストを手で直さずこのコマンドで再生成して貼り替えてください。**

rolldown の依存は現状いずれも自分の依存を持たないため、この 1 階層の列挙で閉包と一致します。将来これが変わったら列挙の深さを見直してください。

```bash
npm view rolldown@<version> dependencies optionalDependencies --json \
  | node -e 'const o = JSON.parse(require("fs").readFileSync(0, "utf8"));
      const names = ["rolldown", ...Object.keys(o.dependencies ?? {}), ...Object.keys(o.optionalDependencies ?? {})];
      [...new Set(names)].sort().forEach((n) => console.log("  - \x27" + n + "\x27"));'
```

## markuplint 設定のメンテナンス

`markuplint.config.cjs` の `performance/head-element-order` は、markuplint 内部の既定値（セレクタ配列 8 要素）を書き写したうえで 1 要素だけ変えたものです。API 上「1 要素だけ差し替える」書き方はできず、配列の全置換しかありません。

🔴 **markuplint を更新したら、既定値が変わっていないか突き合わせてください。**既定値に要素が追加されても、この設定は古い順序を保持し続け、警告も差分も出ません（CI も `npm run check` も検出しません）。

```bash
# pnpm の場合。npm でインストールしたなら node_modules/@markuplint/rules/lib/... を直接見る
sed -n '/^const DEFAULT_VALUE/,/^];/p' \
  node_modules/.pnpm/@markuplint+rules@*/node_modules/@markuplint/rules/lib/head-element-order/index.js
```

上流のソースは [markuplint/markuplint の `packages/@markuplint/rules/src/head-element-order/index.ts`](https://github.com/markuplint/markuplint/blob/main/packages/%40markuplint/rules/src/head-element-order/index.ts)。

## GitHub Actions CI

`.github/workflows/check.yml` 参照。Fork / Clone 後は自動 skip（自分のプロジェクトで有効化する場合は `jobs.check.if` 行を削除）。

## カスタマイズ・構造の変更

詳細は **[mFLOCSS 書籍](https://zenn.dev/shunei/books/mflocss-design)** を参照してください。

差し替えポイントはコード全体で `CUSTOMIZE` コメントを検索すると発見できます。

### ページを増減する

`src` 配下に置いた HTML は自動でビルド対象になります（`vite.config.ts` 側の追加作業はありません。ドットで始まるディレクトリの中だけは対象外です）。逆に、部分テンプレートのような「単体では配信しない HTML」を `src` の下に置くと、それも `dist` に出力されて公開されます。

設定以外の手作業は残ります。`public/sitemap.xml` の URL 一覧と、ヘッダー・ドロワー・フッターのナビは手で直してください。

ヘッダー・ドロワー・フッターを複製する場合、トップページのセクションを指すナビは `/#features` の形（トップページの絶対パス）で書きます。`#features` の形にすると、そのセクションを持たない下層ページでは該当 id が無く、クリックしても無反応になります。

この形式には引き換えがあります。トップページをクエリ付き（`https://example.com/?utm_source=...`）や `/index.html` で開いている訪問者がナビを押すと、同一ページ内のスクロールではなくページ遷移になり、クエリは引き継がれません。そのページ内だけで完結する本文リンク（hero の CTA 等）は `#contact` のままで構いません。

### セクションを増減する

CSS 側で触るのは project 層（`src/assets/css/project/p-*.css`）と `src/assets/css/style.css` の該当 `@import` 行だけです。`.p-*` セレクタは project 層の外に現れないため、project 層のファイルを外しても残りの層は自己完結します。`layer-order.css` の層宣言は空層になっても無害なので、層ごと使わなくなっても削除は不要です。

CSS だけでは終わりません。HTML 本体と、そのセクションを指すヘッダー・ドロワー・フッターのナビ（`/#features` 等）も合わせて直します。ナビが `/#...` 形式のとき、指し先の id が消えても markuplint の `a11y/no-broken-fragment-link` は検出しません。

### 視覚的非表示（`u-visually-hidden`）

`.u-visually-hidden` は画面から隠して支援技術には読ませるユーティリティで、フォーカスを受けても可視化されません。

### head の要素順

`markuplint.config.cjs` が `head-element-order` の順序を上書き宣言しています。規則が見ているのは `meta[charset]` → `meta[http-equiv]` → `meta[name="viewport"]` → `title` → その他の `meta` → `link` → `style` → `script` という**セレクタの並び順だけ**です（`meta` 同士のアルファベット順チェックは無効化しています）。この規則の severity は warning なので、崩しても `npm run check` は通ります。

`title` が一般の `meta` より前に来る並びのため、全ページ共通の要素とページ固有の要素は交互に置くことになります。この並べ方は規則が強制するものではなく本 starter の書き方ですが、共通部を 1 ブロックにまとめて head の末尾へ寄せると `<meta charset>` が先頭 1024 バイトを越え、`html-standard/meta-charset-position`（error）で `npm run check` が落ちることがあります。

## コメント方針

基本方針は「コードには How / テストコードには What / コミットログには Why / コードコメントには Why not」です。

本 starter は学習者がコードを直接読むリファレンス実装のため、**教材例外**として読者に価値のある Why も残します:

- WCAG 達成根拠（例: `inert` 属性が WCAG 2.1.1 Keyboard に直結する旨）
- `CUSTOMIZE` コメントによる差し替えポイントの誘導
- 運用上の注意（値の同期が必要な箇所など）

公開 API（公開 Custom Property の契約説明）にはコメントを必須とします。

書かないもの:

- コードを読めばわかる How / What の説明
- 変更経緯の narration（コミットログ・PR に書くべき内容）

## ビルドと納品

```bash
npm run build
```

`dist/` ディレクトリに最適化されたファイルが出力されます。そのまま静的ホスティング（Netlify, Vercel, Cloudflare Pages 等）にデプロイできます。

サブディレクトリ（例: `https://example.com/my-site/`）にデプロイする場合は、`vite.config.ts` の `base` を変更してください:

```ts
base: '/my-site/',
```

ルート絶対パス（`/` 始まり）で書いた `<a href>` には、`vite.config.ts` の `base-anchor-href` plugin が `base` を前置します（`/#features` → `/my-site/#features`）。開発サーバーとビルドの両方で効きます。

この plugin が書き換えるのは `<a href="/...">` だけです。`<form action="/api/contact">` のような他の属性は対象外なので、必要なら手で直してください。`<a href>` は `base` を含めずに書いてください（`/my-site/about/` と書くと `/my-site/my-site/about/` になります）。

書き換えられないルート絶対パスが残っているとビルドが止まり、該当の href が表示されます（`<area>` やカスタム要素の `href` がこれに当たります）。⚠️ **文字参照で書いた `href`（`&#47;#features`）だけはこの検査にかかりません。**書き換えも検出もされずそのまま出力されるので、使わないでください。

`base` に絶対 URL（CDN 配信）を指定した場合は、そのパス部分だけを前置します（`https://cdn.example.com/sub/` なら `/sub/`）。ルート絶対パスのリンクは表示中のページを基準に解決されるので、パス部分だけで届きます。

`base` を `./` にした場合はビルドが止まります。ルート絶対パスの配信先が決まらないためです。パス形式の `base` にするか、リンクを相対パスに書き換えてください。

納品前にプロジェクト全体で `CUSTOMIZE` を検索し、差し替え忘れがないことを確認してください。

### 404 ページの動作確認

`src/404.html` は本番ホスティングで存在しないパスにアクセスされた際の Not Found ページです。動作確認方法は以下の 3 通り:

| 確認方法 | URL | 期待動作 |
|---------|-----|---------|
| ローカル dev（見た目確認）| `http://localhost:5173/404.html` | HTTP 200 で配信（デザイン確認用、HMR 効く）|
| ローカル preview（HTTP 404 検証）| `http://localhost:4173/nonexistent` | `vite.config.ts` の preview-404-fallback plugin が HTTP 404 で配信 |
| 本番ホスティング | `https://example.com/nonexistent` | HTTP 404 で配信 |

ローカル動作確認の手順:

```bash
npm run build
npm run preview
# 別タブで http://localhost:4173/nonexistent にアクセス
```

本番側は **Cloudflare Pages / Netlify / Vercel / GitHub Pages のいずれも `dist/404.html` を root に配置するだけで自動配信**します（追加設定ファイル不要）。ローカル `npm run preview` でも同じ動作を再現するため `vite.config.ts` に `preview-404-fallback` plugin を含めています。

## アセット配置規約

本 starter の静的アセット配置基準です。

| 対象 | 配置先 | 理由 |
|------|--------|------|
| favicon / OGP / robots.txt / sitemap.xml | `public/` 直下 | ルートパス固定が必要な静的ファイル |
| viewport.js 等の非バンドル JS | `public/assets/scripts/` | `src/assets/scripts/` と階層を対称に揃えつつ非バンドル維持 |

Vite は `publicDir`（= `public/`）配下のファイルをそのまま `dist/` へコピーします。`public/assets/scripts/` に置くことで `dist/assets/scripts/` に出力され、バンドル対象の `src/assets/scripts/` の出力先と階層が一致します。

## ブレークポイント値の CSS/JS 同期

`public/assets/scripts/viewport.js` の `VIEWPORT_MIN` は、`src/assets/css/token/structure.css` の `--viewport-min` と同じ値に合わせてください。この値を変更する場合は両方を更新する必要があります。CSS と JS の基準値を一致させることで、400px 未満の端末でもレイアウト崩れを防ぎ、変更時の修正漏れを防止できます。

## ドロワー（p-drawer / c-overlay）

### HTML 構造

`dialog.p-drawer` は `header` の **兄弟要素**として配置します（header の内側ではない）。`show()` を採用しているため、`[data-drawer-inert]` を持つ要素に JS から `inert` を付与して focus trap を再現します。

```html
<header class="l-header p-header">...</header>
<div class="c-overlay" data-drawer-overlay hidden></div>
<dialog class="p-drawer" id="drawer" data-drawer aria-labelledby="drawer-title">
  ...
</dialog>
<main ... data-drawer-inert>...</main>
```

### z-index 設計

token は `src/assets/css/token/z-index.css` を参照。

starter 固有の設計判断: `--z-header` を `--z-drawer` より前面に置き、ドロワー open 中もハンバーガーボタン（header 内）が常にアクセス可能。

### show() 運用上の SR 実機検証手順

`show()` は `showModal()` の自動 focus trap を持たないため、`inert` で同等の挙動を再現できているか実機検証が必要です。`aria-modal="true"` は付与しません（`show()` は modeless であり、ブラウザ・SR はダイアログを modal として扱わないため、`aria-modal="true"` は実態と矛盾する。ダイアログとしての announce は `<dialog>` の暗黙 role="dialog" が担う）。

| 環境 | 検証項目 |
|------|---------|
| NVDA + Firefox / Chrome | Browse mode で Tab / 矢印キーが drawer 外に脱出しないこと |
| JAWS + Chrome | Virtual cursor（PC Cursor）で drawer 外要素が読み上げられないこと |
| VoiceOver + Safari (macOS / iOS) | VO + 矢印 / Rotor で drawer 外が読み上げられないこと |

ドロワー open 状態でのチェックリスト:

- [ ] `[data-drawer-inert]` を付与した全要素が SR 読み上げ対象から除外される
- [ ] Tab で drawer 内のフォーカス可能要素のみを巡回する（drawer 外に脱出しない）
- [ ] ハンバーガーボタン（trigger）は inert ではないので Tab で到達して閉じられる
- [ ] Escape キーで close される（JS 実装）
- [ ] `<dialog>` の暗黙 role="dialog" により SR が「ダイアログ」として announce する
- [ ] `aria-labelledby` で参照されるドロワータイトルが SR で読み上げられる

`inert` 属性は WCAG 2.1.1 Keyboard (Level A) と 2.4.3 Focus Order に直結します。新規の自己配置型 Component を追加する際は、必ず `data-drawer-inert` の付与要否を確認してください（後述「data-drawer-inert」節と同じ運用）。

### data-drawer-inert — focus trap 対象マーカー

Drawer open 時に **Drawer 外の全てのフォーカス可能要素を `inert` 化**する必要があります（`dialog.show()` は `showModal()` と異なり自動で inert 化しないため、JS から `setAttribute('inert', '')` で制御）。`data-drawer-inert` は「Drawer open 時に inert 化すべき要素」を明示するマーカー属性です。

#### 付与対象

Drawer と Hamburger トリガー**以外**の、フォーカス可能（= Tab 到達可能）な要素すべて。具体的には:

- `<header>` の子要素（logo リンク・nav 等、ただし hamburger と drawer は除外）
- `<main>` / `<footer>` 等のランドマーク
- `<header>` 外の常駐要素（`c-back-to-top` 等、自己配置型 Component — spec §5.5）
- skip-link（Drawer open 中は到達不要のため）

**新規の自己配置型 Component（例: fixed chat widget、cookie banner 等）を追加する際は、必ず `data-drawer-inert` の付与要否を確認してください。**付与漏れがあると Drawer open 中に Tab が Drawer 外へ脱出し、focus trap が破綻します（WCAG 2.1.1 Keyboard A 違反）。

#### JS 側

`querySelectorAll('[data-drawer-inert]')` で全対象要素を取得 → `openDrawer` で `inert` 属性付与、`closeDrawer` で削除するだけ。新規対象を追加しても JS 側の変更は不要です。
