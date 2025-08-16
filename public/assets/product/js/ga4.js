// /src/scripts/ga4.js
const GA_ID = 'G-2J6J3S3R2R'; // <-- your GA4 Measurement ID

// Safe global access
function getWin() {
  return typeof window !== 'undefined' ? window : undefined;
}

// Inject gtag.js once
function loadGtag(id = GA_ID) {
  const w = getWin();
  if (!w) return;
  if (w.__gtagLoaded) return;

  w.dataLayer = w.dataLayer || [];
  function gtag(){ w.dataLayer.push(arguments); }
  w.gtag = w.gtag || gtag;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);

  // Init, but disable auto page_view so we can control SPA hits
  w.gtag('js', new Date());
  w.gtag('config', id, { send_page_view: false });

  w.__gtagLoaded = true;
}

// Send a page_view
function trackPageview(url) {
  const w = getWin();
  if (!w || !w.gtag) return;

  // GA4 page_view event
  w.gtag('event', 'page_view', {
    page_location: url || w.location.href,
    page_path: w.location.pathname + w.location.search + w.location.hash,
    page_title: document.title
  });
}

// Optional helper for custom events
function trackEvent(name, params = {}) {
  const w = getWin();
  if (!w || !w.gtag) return;
  w.gtag('event', name, params);
}

// Wire up lifecycle
function initGA() {
  loadGtag();

  // Initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => trackPageview());
  } else {
    trackPageview();
  }

  // Astro view transitions (client-side navigations)
  // Fires after Astro swaps the page content
  document.addEventListener('astro:after-swap', () => {
    trackPageview();
  });

  // Also handle full page loads triggered by prefetch
  document.addEventListener('astro:page-load', () => {
    trackPageview();
  });
}

// Auto init in browser
if (typeof window !== 'undefined') {
  initGA();
}

// Expose API if you want to import and use elsewhere
export { initGA, trackPageview, trackEvent };
