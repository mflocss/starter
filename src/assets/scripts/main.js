/**
 * mFLOCSS Starter — メインスクリプト
 *
 * 機能:
 * - ドロワーメニュー（dialog show/close + inert）
 * - スクロールアニメーション（IntersectionObserver + data-animate）
 * - スタッガーアニメーション（data-stagger）
 * - Back to Top ボタン表示制御
 *
 * data-immediate: CSS 完結のアニメーション（JS 待ちなし）。LCP 要素の FOIC 防止に使用。
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

  // drawer 内の閉じるボタン（header inert 化により hamburger が使えない場合の代替動線）
  const drawerCloseButton = drawer.querySelector('[data-drawer-close]');
  if (drawerCloseButton) {
    drawerCloseButton.addEventListener('click', () => {
      closeDrawer();
      hamburgers[0]?.focus({ preventScroll: true });
    });
  }

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
 * フォームバリデーション（:user-invalid → aria-invalid + error container 表示制御）を初期化する。
 * submit 時・invalid イベント時に aria-invalid="true" と error container を表示し、
 * 修正後 input イベントで valid になったら解除する。
 * @param {Object} [options] - カスタマイズオプション
 * @param {string} [options.formSelector='.c-form'] - フォームのセレクター
 */
function initFormValidation(options = {}) {
  const { formSelector = '.c-form' } = options;

  const forms = document.querySelectorAll(formSelector);
  if (forms.length === 0) return;

  forms.forEach((form) => {
    const fields = form.querySelectorAll(
      'input[aria-describedby], select[aria-describedby], textarea[aria-describedby]',
    );

    function showError(field) {
      field.setAttribute('aria-invalid', 'true');
      const errorEl = document.getElementById(field.getAttribute('aria-describedby'));
      if (errorEl) errorEl.hidden = false;
    }

    function clearError(field) {
      field.removeAttribute('aria-invalid');
      const errorEl = document.getElementById(field.getAttribute('aria-describedby'));
      if (errorEl) errorEl.hidden = true;
    }

    fields.forEach((field) => {
      field.addEventListener('invalid', () => showError(field));
      field.addEventListener('input', () => {
        if (field.validity.valid) clearError(field);
      });
    });

    // fieldset の radio group: submit 失敗時に plan-error を表示
    const radioGroups = form.querySelectorAll('fieldset[aria-describedby]');
    radioGroups.forEach((fieldset) => {
      const radios = fieldset.querySelectorAll('input[type="radio"]');
      const firstRequired = fieldset.querySelector('input[type="radio"][required]');
      if (!firstRequired) return;

      firstRequired.addEventListener('invalid', () => {
        fieldset.setAttribute('aria-invalid', 'true');
        const errorEl = document.getElementById(fieldset.getAttribute('aria-describedby'));
        if (errorEl) errorEl.hidden = false;
      });

      radios.forEach((radio) => {
        radio.addEventListener('change', () => {
          fieldset.removeAttribute('aria-invalid');
          const errorEl = document.getElementById(fieldset.getAttribute('aria-describedby'));
          if (errorEl) errorEl.hidden = true;
        });
      });
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
