// Viewport scale: fix layout at VIEWPORT_MIN when screen is narrower.
// CUSTOMIZE: must match --viewport-min in tokens/structure.css
const VIEWPORT_MIN = 400;
const meta = document.querySelector('meta[name="viewport"]');

function updateViewport() {
  const value = window.outerWidth > VIEWPORT_MIN ? 'device-width' : String(VIEWPORT_MIN);
  const content = `width=${value},initial-scale=1`;
  if (meta.content !== content) {
    meta.content = content;
  }
}

updateViewport();
new ResizeObserver(updateViewport).observe(document.documentElement);
