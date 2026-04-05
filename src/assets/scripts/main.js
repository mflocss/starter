/**
 * mFLOCSS Starter — メインスクリプト
 *
 * 機能:
 * - ドロワーメニュー（dialog show/close + inert）
 * - スクロールアニメーション（IntersectionObserver + data-animate）
 * - スタッガーアニメーション（data-stagger）
 * - Back to Top ボタン表示制御
 */

function initDrawer() {
  const drawer = document.querySelector('[data-drawer]');
  if (!drawer) return;

  const overlay = document.querySelector('[data-drawer-overlay]');
  if (overlay) overlay.style.setProperty('--overlay-z', 'calc(var(--z-drawer) - 1)');
  const hamburgers = document.querySelectorAll('[data-hamburger]');
  const inertTargets = document.querySelectorAll('[data-drawer-inert]');
  const drawerLinks = drawer.querySelectorAll('a');

  function openDrawer() {
    if (overlay) overlay.hidden = false;
    drawer.show();
    // rAF 2段：show() 直後に付与すると初期状態が描画されずアニメーションが効かない
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawer.dataset.open = '';
      });
    });
    inertTargets.forEach((el) => el.setAttribute('inert', ''));
    hamburgers.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));

    const firstFocusable = drawer.querySelector('a, button, [tabindex="0"]');
    firstFocusable?.focus({ preventScroll: true });
  }

  function closeDrawer() {
    delete drawer.dataset.open;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (overlay) overlay.hidden = true;
      drawer.close();
    } else {
      drawer.addEventListener(
        'transitionend',
        () => {
          if (overlay) overlay.hidden = true;
          drawer.close();
        },
        { once: true },
      );
    }

    inertTargets.forEach((el) => el.removeAttribute('inert'));
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

  // ページ遷移リンクはそのまま（新ページにドロワーは存在しない）
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
}

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

function initStagger() {
  const containers = document.querySelectorAll('[data-stagger]');
  if (containers.length === 0) return;

  containers.forEach((container) => {
    const animateName = container.dataset.stagger;
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      child.dataset.animate = animateName;
      child.style.setProperty('--stagger-delay', `${(index * 0.1).toFixed(1)}s`);
    });
  });
}

function initBackToTop() {
  const backToTop = document.querySelector('[data-back-to-top]');
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

initDrawer();
initStagger();
initScrollAnimation();
initBackToTop();
