import '../css/style.css';

const observeAnimations = () => {
  const targets = document.querySelectorAll('[class*="a-fade-in"]');

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

document.addEventListener('DOMContentLoaded', observeAnimations);
