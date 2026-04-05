/**
 * mFLOCSS Starter — メインスクリプト
 *
 * 機能:
 * - ドロワーメニュー（dialog show/close + inert）
 * - スクロールアニメーション（IntersectionObserver + data-animate）
 * - スタッガーアニメーション（data-stagger）
 * - Back to Top ボタン表示制御
 */

/* ----------------------------------------
 * ドロワーメニュー
 * ---------------------------------------- */

function initDrawer() {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;

  const hamburgers = document.querySelectorAll('[data-hamburger]');
  const nav = document.querySelector('[data-nav]');
  const skipLink = document.querySelector('.c-skip-link');
  const logo = document.querySelector('.p-header__logo');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const drawerLinks = drawer.querySelectorAll('a');

  function openDrawer() {
    drawer.show();
    // 2フレーム遅延で data-open を付与（display: none → block 後に transform をトランジション）
    // 1フレームだとブラウザによっては同一フレームになる場合があるため2重にする
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawer.dataset.open = '';
      });
    });
    skipLink?.setAttribute('inert', '');
    logo?.setAttribute('inert', '');
    nav?.setAttribute('inert', '');
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));

    // ドロワー内の最初のフォーカス可能要素にフォーカスを移動
    const firstFocusable = drawer.querySelector('a, button, [tabindex="0"]');
    firstFocusable?.focus();
  }

  function closeDrawer() {
    delete drawer.dataset.open;

    function handleTransitionEnd() {
      drawer.removeEventListener('transitionend', handleTransitionEnd);
      drawer.close();
    }

    // reduced-motion の場合はトランジションがないため即座に close
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawer.close();
    } else {
      drawer.addEventListener('transitionend', handleTransitionEnd);
    }

    skipLink?.removeAttribute('inert');
    logo?.removeAttribute('inert');
    nav?.removeAttribute('inert');
    main?.removeAttribute('inert');
    footer?.removeAttribute('inert');
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
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

  // ドロワー内アンカーリンク（#xxx）クリックでドロワーを閉じる
  // ページ遷移リンクはそのまま遷移（新ページにドロワーは存在しない）
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        closeDrawer();
        hamburgers[0]?.focus();
      }
    });
  });

  // ::backdrop クリックで閉じる
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
      hamburgers[0]?.focus();
    }
  });

  // show() は Escape キーで自動的に閉じないため、手動で処理
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.open) {
      closeDrawer();
      hamburgers[0]?.focus();
    }
  });
}

/* ----------------------------------------
 * スクロールアニメーション（data-animate）
 * ---------------------------------------- */

function initScrollAnimation() {
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
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    },
  );

  targets.forEach((target) => {
    observer.observe(target);
  });
}

/* ----------------------------------------
 * スタッガーアニメーション（data-stagger）
 * ---------------------------------------- */

function initStagger() {
  const containers = document.querySelectorAll('[data-stagger]');
  if (containers.length === 0) return;

  containers.forEach((container) => {
    // data-stagger の値をアニメーション名として子要素に data-animate を動的付与
    const animateName = container.dataset.stagger;
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      child.dataset.animate = animateName;
      child.style.setProperty('--stagger-delay', `${(index * 0.1).toFixed(1)}s`);
    });
  });
}

/* ----------------------------------------
 * Back to Top
 * ---------------------------------------- */

function initBackToTop() {
  const backToTop = document.querySelector('.c-back-to-top');
  if (!backToTop) return;

  const threshold = 300;

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

/* ----------------------------------------
 * 初期化
 * ---------------------------------------- */

initDrawer();
initStagger();
initScrollAnimation();
initBackToTop();
