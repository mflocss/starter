import '../css/style.css';

const observeAnimations = () => {

  const targets = document.querySelectorAll('[class*="a-fade-in"], .a-scale-in, .a-stagger');

  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  targets.forEach((target) => observer.observe(target));
};

const initStaggerDelays = () => {

  const containers = document.querySelectorAll('.a-stagger');

  containers.forEach((container) => {
    Array.from(container.children).forEach((child, index) => {
      child.style.setProperty('--_delay', `${index * 0.1}s`);
    });
  });
};

const markCurrentNav = () => {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.p-header__nav-link');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (path === href || (href !== '/' && path.startsWith(href))) {
      link.classList.add('is-current');
    }
  });
};

const initMobileNav = () => {
  const button = document.querySelector('.p-header__hamburger');
  const nav = document.querySelector('.p-header__nav');

  if (!button || !nav) return;

  const closeNav = () => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
  };

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeNav();
    } else {
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'メニューを閉じる');
      nav.classList.add('is-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      button.focus();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  markCurrentNav();
  initMobileNav();
  initStaggerDelays();
  observeAnimations();
});
