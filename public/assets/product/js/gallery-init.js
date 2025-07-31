// public/assets/js/gallery-init.js

document.addEventListener('DOMContentLoaded', () => {
    // load the UMD build
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/baguettebox.js@1.11.1/dist/baguetteBox.min.js';
    s.onload = () => {
      baguetteBox.run('.gallery', {
        // your options...
        captions: function (el) {
          const img = el.querySelector('img');
          const base = img.alt ? `<div class="lightbox-caption">${img.alt}</div>` : '';
          const postUrl = el.dataset.postUrl;
          const extra = postUrl
            ? `<div class="lightbox-post-link">
                 <a href="${postUrl}" target="_blank" rel="noopener">
                   Read related post
                 </a>
               </div>`
            : '';
          return base + extra;
        },
        buttons: 'auto',
        async: false,
        overlayBackgroundColor: 'rgba(17,16,16,0.9)',
        onStart: repositionCaptions,
        onChange: repositionCaptions,
      });
    };
    document.head.appendChild(s);
  
    function repositionCaptions() {
      document
        .querySelectorAll('#baguetteBox-slider .full-image figure')
        .forEach((fig) => {
          const img = fig.querySelector('img');
          const cap = fig.querySelector('figcaption');
          if (img && cap && img.nextSibling !== cap) {
            cap.style.position = 'static';
            cap.style.transform = 'none';
            cap.style.marginTop = '1rem';
            img.after(cap);
          }
        });
    }
  });
  