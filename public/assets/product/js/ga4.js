// /public/assets/product/js/ga4.js
(function () {
  const GA_ID = 'G-2J6J3S3R2R';
  if (typeof window === 'undefined') return;
  const w = window;
  if (w.__ga4Init) return; // prevent double init

  // dataLayer + gtag bootstrap
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function(){ w.dataLayer.push(arguments); };

  // load gtag.js
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);

  // init (disable auto page_view; we’ll send manually)
  w.gtag('js', new Date());
  w.gtag('config', GA_ID, { send_page_view: false /*, debug_mode: true */ });

  function trackPageview(url) {
    if (!w.gtag) return;
    // console.log('[GA4] page_view', url || w.location.href);
    w.gtag('event', 'page_view', {
      page_location: url || w.location.href,
      page_path: w.location.pathname + w.location.search + w.location.hash,
      page_title: document.title
    });
  }

  function trackEvent(name, params) {
    if (!w.gtag) return;
    w.gtag('event', name, params || {});
  }

  // expose helpers if you want to call them elsewhere
  w.GA4 = { trackPageview: trackPageview, trackEvent: trackEvent };

  // first load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ trackPageview(); });
  } else {
    trackPageview();
  }

  // Astro client navigations
  document.addEventListener('astro:after-swap', function(){ trackPageview(); });
  document.addEventListener('astro:page-load', function(){ trackPageview(); });

  w.__ga4Init = true;
})();
