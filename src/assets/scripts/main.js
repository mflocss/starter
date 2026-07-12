/**
 * mFLOCSS Starter — メインスクリプト
 *
 * 機能:
 * - ドロワーメニュー（dialog show/close + inert）
 * - スクロールアニメーション（IntersectionObserver + data-animate）
 * - スタッガーアニメーション（data-stagger）
 * - Back to Top ボタン表示制御
 * - フォームバリデーション a11y（HTML5 制約検証 + role="alert" 動的表示）
 *
 * data-immediate: CSS 完結のアニメーション（JS 待ちなし）。ファーストビュー要素のアニメーション遅延防止に使用。
 * data-animate:   JS 待ちアニメーション。IntersectionObserver が data-visible を付与して再生開始。
 *
 * 各 init 関数は options 引数でカスタマイズ可能。デフォルト値は関数内で定義。
 */

/**
 * ドロワーメニュー（dialog show/close + inert）を初期化する。
 * @param {Object} [options] - カスタマイズオプション
 * @param {string} [options.breakpoint='48rem'] - PC 判定のブレイクポイント。p-header.css の `@media (width >= ...)` と同値にすること（SP/PC 切替時にドロワーを自動で閉じる判定に使用）。CSS が rem 基準のため、JS 側も rem 表記で帯域ズレを防ぐ
 */
function initDrawer(options = {}) {
  const { breakpoint = '48rem' } = options;

  const drawer = document.querySelector('[data-drawer]');
  if (!drawer) return;

  const overlay = document.querySelector('[data-drawer-overlay]');
  const hamburgers = document.querySelectorAll('[data-hamburger]');
  const inertTargets = document.querySelectorAll('[data-drawer-inert]');
  const drawerLinks = drawer.querySelectorAll('a');

  // 世代カウンター：open / close / PC 化の各操作が自分の世代番号を持ち、rAF やアニメ完了 await 後の
  // 遅延処理は「自分の世代がまだ最新か」を確認してから状態を触る。古い操作の遅延コールバックが
  // 新しい状態を上書きするのを防ぐ（アニメ中の breakpoint 越え resize / 連続トグルの取りこぼし対策）。
  let generation = 0;

  function openDrawer() {
    const gen = ++generation;

    if (overlay) overlay.hidden = false;
    drawer.show();
    inertTargets.forEach((el) => el.setAttribute('inert', ''));
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));

    // rAF 2段：show() 直後に付与すると初期状態が描画されずアニメーションが効かない
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (gen !== generation || !drawer.open) return;
        drawer.dataset.open = '';
      });
    });

    const firstFocusable = drawer.querySelector('a, button, [tabindex="0"]');
    firstFocusable?.focus({ preventScroll: true });
  }

  // アニメ完了待ち。transition 無効化カスタマイズや無限アニメ同居では完了イベントが発火せず永久に
  // close できなくなるため（Why not: 完了待ちが解決しない構成での恒久 deadlock 回避）、上限 800ms で
  // 打ち切る（--duration-normal 0.3s + 余裕）。
  function waitForDrawerAnimation() {
    const TIMEOUT_MS = 800;
    const timeout = new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS));
    const animations = drawer.getAnimations({ subtree: true });
    const done =
      animations.length > 0
        ? Promise.all(animations.map((a) => a.finished)).catch(() => {})
        : new Promise((resolve) => {
            drawer.addEventListener('transitionend', resolve, { once: true });
          });
    return Promise.race([done, timeout]);
  }

  async function closeDrawer() {
    if (!drawer.open) return;
    const gen = ++generation;

    delete drawer.dataset.open;
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await waitForDrawerAnimation();
      // 待機中に新しい操作（別の open / close / PC 化）が始まっていたら後片付けを新世代に委ねる
      if (gen !== generation) return;
    }

    if (overlay) overlay.hidden = true;
    drawer.close();
    inertTargets.forEach((el) => el.removeAttribute('inert'));
  }

  // PC 化時はドロワー自体が不可視になるためアニメ不要。世代を進めて進行中の open / close の残処理を
  // 無効化し、状態を同期的に解除する（アニメ完了待ちの窓で close が取りこぼされる問題を回避）。
  function closeImmediately() {
    ++generation;
    delete drawer.dataset.open;
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    if (overlay) overlay.hidden = true;
    if (drawer.open) drawer.close();
    inertTargets.forEach((el) => el.removeAttribute('inert'));
  }

  hamburgers.forEach((btn) => {
    btn.addEventListener('click', () => {
      // トグル判定は「開く意図の状態」(data-open) を基準にする。アニメ中でも受け付けて世代を進める
      // ため、閉じアニメ中の再クリックで開き直せる（native drawer.open は close() まで true のまま
      // 残るのでトグル基準に使わない）。
      if ('open' in drawer.dataset) {
        closeDrawer();
        btn.focus();
      } else {
        openDrawer();
      }
    });
  });

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        closeDrawer();
        hamburgers[0]?.focus({ preventScroll: true });
      }
    });
  });

  overlay?.addEventListener('click', () => {
    closeDrawer();
    hamburgers[0]?.focus({ preventScroll: true });
  });

  // show() は Escape キーで自動的に閉じないため、手動で処理
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.open) {
      closeDrawer();
      hamburgers[0]?.focus({ preventScroll: true });
    }
  });

  // p-header.css の @media (width >= 48rem) と同一表記。px 換算するとルートフォントサイズ変更時に
  // CSS の rem 判定と帯域がズレるため、rem のまま matchMedia へ渡す。
  window.matchMedia(`(width >= ${breakpoint})`).addEventListener('change', (e) => {
    if (e.matches) closeImmediately();
  });
}

/**
 * スクロールアニメーション（IntersectionObserver で `data-visible` を付与）を初期化する。
 * @param {Object} [options] - カスタマイズオプション
 * @param {number} [options.threshold=0.1] - 要素が何割見えたら発火するか（0〜1）
 * @param {string} [options.rootMargin='0px 0px -40px 0px'] - 発火タイミング調整。下端を負の値にするとやや早めに発火
 */
function initScrollAnimation(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options;

  const targets = document.querySelectorAll('[data-animate]');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.dataset.visible = '';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold, rootMargin },
  );

  targets.forEach((target) => {
    observer.observe(target);
  });
}

/**
 * スタッガーアニメーションを初期化する（`data-stagger` の子要素に順番に delay を付与）。
 * @param {Object} [options] - カスタマイズオプション
 * @param {number} [options.delayStep=0.1] - 子要素ごとの遅延時間（秒）
 */
function initStagger(options = {}) {
  const { delayStep = 0.1 } = options;

  const containers = document.querySelectorAll('[data-stagger]');
  if (containers.length === 0) return;
  containers.forEach((container) => {
    const animateName = container.dataset.stagger;
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      child.dataset.animate = animateName;
      child.style.setProperty('--stagger-delay', `${(index * delayStep).toFixed(2)}s`);
    });
  });
}

/**
 * Back to Top ボタンの表示制御を初期化する。
 * @param {Object} [options] - カスタマイズオプション
 * @param {number} [options.threshold=300] - 表示を切替えるスクロール量（px）
 */
function initBackToTop(options = {}) {
  // NOTE: CSS animation-timeline: scroll() で代替可能だが、opacity/visibility transition と競合するため
  //       smooth fade UX 維持を優先して JS 実装を選択。@property + calc() 構成での CSS 化は将来検討。
  const { threshold = 300 } = options;

  const backToTop = document.querySelector('[data-back-to-top]');
  if (!backToTop) return;

  function toggleVisibility() {
    if (window.scrollY > threshold) {
      backToTop.dataset.visible = '';
    } else {
      delete backToTop.dataset.visible;
    }
  }

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

/**
 * フォームバリデーション a11y を初期化する（HTML5 制約検証 + role="alert" 動的表示）。
 * フォームに novalidate が必要（ブラウザネイティブ tooltip を抑制して JS で制御）。
 * @param {Object} [options] - カスタマイズオプション
 * @param {string} [options.formSelector='[data-validate]'] - 対象フォームのセレクタ
 */
function initFormValidation(options = {}) {
  const { formSelector = '[data-validate]' } = options;
  const forms = document.querySelectorAll(formSelector);
  if (forms.length === 0) return;

  forms.forEach((form) => {
    const fields = form.querySelectorAll('[aria-describedby]');

    /**
     * fieldset は制約検証対象外（barred from constraint validation）のため、
     * 内部の最初の required 入力要素を代わりに検査する。
     */
    function getRepresentativeInput(field) {
      if (field.tagName === 'FIELDSET') {
        return field.querySelector('[required]') ?? null;
      }
      return field;
    }

    /**
     * aria-describedby は複数 ID（ヒント文＋エラー文など）を空白区切りで持てるため、
     * 各 ID を順に引いて `data-form-error` を持つ要素をエラー表示先として採用する。
     * 先頭 ID 決め打ちだとヒント文が先に来た場合にフィールド検証が黙って無効化される。
     */
    function getErrorElement(field) {
      const describedby = field.getAttribute('aria-describedby');
      if (!describedby) return null;
      for (const id of describedby.trim().split(/\s+/)) {
        const el = document.getElementById(id);
        if (el?.hasAttribute('data-form-error')) return el;
      }
      return null;
    }

    form.addEventListener('submit', (event) => {
      let firstInvalid = null;

      fields.forEach((field) => {
        const errorEl = getErrorElement(field);
        if (!errorEl) return;

        const input = getRepresentativeInput(field);
        if (!input) return;

        if (!input.checkValidity()) {
          errorEl.textContent = input.validationMessage;
          errorEl.hidden = false;
          field.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) firstInvalid = input;
        } else {
          errorEl.textContent = '';
          errorEl.hidden = true;
          field.removeAttribute('aria-invalid');
        }
      });

      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus({ preventScroll: false });
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // reset 時にエラー表示 / aria-invalid が残留しないよう全フィールドをクリアする
    form.addEventListener('reset', () => {
      fields.forEach((field) => {
        const errorEl = getErrorElement(field);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.hidden = true;
        }
        field.removeAttribute('aria-invalid');
      });
    });

    fields.forEach((field) => {
      const errorEl = getErrorElement(field);
      if (!errorEl) return;

      const input = getRepresentativeInput(field);
      if (!input) return;

      const handler = () => {
        if (input.checkValidity()) {
          errorEl.textContent = '';
          errorEl.hidden = true;
          field.removeAttribute('aria-invalid');
        }
      };

      // input は textarea / input[type=text|email|tel] 等
      // change は select / radio / checkbox
      field.addEventListener('input', handler);
      field.addEventListener('change', handler);
    });
  });
}

// 初期化（デフォルト値で動作）
initDrawer();
initStagger();
initScrollAnimation();
initBackToTop();
initFormValidation();

// CUSTOMIZE 例:
// initDrawer({ breakpoint: '64rem' });
// initStagger({ delayStep: 0.15 });
// initScrollAnimation({ threshold: 0.3, rootMargin: '0px 0px -100px 0px' });
// initBackToTop({ threshold: 500 });
// initFormValidation({ formSelector: '[data-validate]' });
