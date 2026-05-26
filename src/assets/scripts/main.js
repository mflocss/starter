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
 * @param {number} [options.breakpoint=768] - PC 判定のブレイクポイント (px)。p-header.css の `@media` と同値にすること（SP/PC 切替時にドロワーを自動で閉じる判定に使用）
 */
function initDrawer(options = {}) {
  const { breakpoint = 768 } = options;

  const drawer = document.querySelector('[data-drawer]');
  if (!drawer) return;

  const overlay = document.querySelector('[data-drawer-overlay]');
  const hamburgers = document.querySelectorAll('[data-hamburger]');
  const inertTargets = document.querySelectorAll('[data-drawer-inert]');
  const drawerLinks = drawer.querySelectorAll('a');

  let isAnimating = false;

  function openDrawer() {
    if (isAnimating) return;
    isAnimating = true;

    if (overlay) overlay.hidden = false;
    drawer.show();
    // rAF 2段：show() 直後に付与すると初期状態が描画されずアニメーションが効かない
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!drawer.open) {
          isAnimating = false;
          return;
        }
        drawer.dataset.open = '';
        isAnimating = false;
      });
    });
    inertTargets.forEach((el) => el.setAttribute('inert', ''));
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));

    const firstFocusable = drawer.querySelector('a, button, [tabindex="0"]');
    firstFocusable?.focus({ preventScroll: true });
  }

  async function closeDrawer() {
    if (!drawer.open) return;
    if (isAnimating) return;
    isAnimating = true;

    delete drawer.dataset.open;
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (overlay) overlay.hidden = true;
      drawer.close();
      inertTargets.forEach((el) => el.removeAttribute('inert'));
    } else {
      const allAnimations = drawer.getAnimations({ subtree: true });
      if (allAnimations.length > 0) {
        await Promise.all(allAnimations.map((a) => a.finished)).catch(() => {});
      } else {
        await new Promise((resolve) => {
          drawer.addEventListener('transitionend', resolve, { once: true });
        });
      }
      if (overlay) overlay.hidden = true;
      drawer.close();
      inertTargets.forEach((el) => el.removeAttribute('inert'));
    }

    isAnimating = false;
  }

  hamburgers.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (drawer.open) {
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

  window.matchMedia(`(min-width: ${breakpoint}px)`).addEventListener('change', (e) => {
    if (e.matches) closeDrawer();
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

    // 送信時バリデーション
    form.addEventListener('submit', (event) => {
      let firstInvalid = null;

      fields.forEach((field) => {
        const errorId = field.getAttribute('aria-describedby');
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;

        const input = getRepresentativeInput(field);
        if (!input) return;

        if (!input.checkValidity()) {
          // エラー表示
          errorEl.textContent = input.validationMessage;
          errorEl.hidden = false;
          field.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) firstInvalid = input;
        } else {
          // エラー解除
          errorEl.textContent = '';
          errorEl.hidden = true;
          field.removeAttribute('aria-invalid');
        }
      });

      // 最初のエラーフィールドに focus
      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus({ preventScroll: false });
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // input / change イベントで有効化時にエラー解除
    fields.forEach((field) => {
      const errorId = field.getAttribute('aria-describedby');
      const errorEl = document.getElementById(errorId);
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
// initDrawer({ breakpoint: 1024 });
// initStagger({ delayStep: 0.15 });
// initScrollAnimation({ threshold: 0.3, rootMargin: '0px 0px -100px 0px' });
// initBackToTop({ threshold: 500 });
// initFormValidation({ formSelector: '[data-validate]' });
