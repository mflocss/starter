/**
 * viewport 最小幅制御（早期実行が必要）
 *
 * 目的:
 * - 極小画面（outerWidth ≤ VIEWPORT_MIN）で viewport を固定幅にする
 * - VIEWPORT_MIN 以上ではレスポンシブ動作（device-width）に戻す
 * - CSS の `--viewport-min` と値を同期し、レイアウト崩れを防ぐ
 *
 * なぜ head で blocking 実行か:
 * - 描画開始前に viewport の content を確定する必要がある
 * - defer / async にすると初回レンダリング後に viewport が変わり CLS が発生する
 * - ResizeObserver で resize にも追従するため、初期値だけでなく継続的に更新
 *
 * CUSTOMIZE:
 * - VIEWPORT_MIN の値は token/structure.css の `--viewport-min` と必ず一致させる
 * - 最小幅制限が不要なサイト（全幅でレスポンシブ対応済み）は
 *   <script src="/assets/scripts/viewport.js"> および ResizeObserver ごと削除可
 */

// CUSTOMIZE: must match --viewport-min in token/structure.css
const VIEWPORT_MIN = 400;
const meta = document.querySelector('meta[name="viewport"]');

function updateViewport() {
  const value = window.outerWidth > VIEWPORT_MIN ? 'device-width' : String(VIEWPORT_MIN);
  // 固定幅指定時は initial-scale を併記しない（一部端末で横スクロールを誘発するため）
  const content = value === 'device-width' ? `width=${value},initial-scale=1` : `width=${value}`;
  if (meta.content !== content) {
    meta.content = content;
  }
}

updateViewport();
new ResizeObserver(updateViewport).observe(document.documentElement);
