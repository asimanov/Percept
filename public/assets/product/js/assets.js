// Navigation
// 
$(".navigation__icon-menu").click(function(event){
    $(".navigation__list").toggleClass("active");
    $("main").toggleClass("inactive");
    $("body").toggleClass("noScroll");
    $("#menu-switch").toggleClass("bt-times");
    event.preventDefault();
});

$(".navigation-link").click(function(){
    $(".navigation-list").toggleClass("active");
    $("#menu-switch").toggleClass("bt-times");
});

$("main").click(function(){
    $(".navigation__list").removeClass("active");
    $("main").removeClass("inactive");
    $("body").removeClass("noScroll");
    $("#menu-switch").removeClass("bt-times");
});

// Show Page Title Hint
// 
$win = $(window);
  $win.on('scroll', function() {
  $(".page-hint").toggleClass('page-hint--visible', $win.scrollTop() > 180);
});

// Show Post Share
// 
$win = $(window);
  $win.on('scroll', function() {
  $(".post__share").toggleClass('show', $win.scrollTop() > 180);
});

// Link author
// 
document.addEventListener("DOMContentLoaded", () => {
  const authorMap = {
    "Anton Simanov": "/antonsimanov",
    // "Jane Doe": "/janedoe"
  };

  document.querySelectorAll("span").forEach(span => {
    const spanText = span.textContent || "";
    if (!Object.keys(authorMap).some(n => spanText.includes(n))) return;

    // Skip if already linked correctly
    for (const [name, url] of Object.entries(authorMap)) {
      if (span.querySelector(`a[href="${url}"]`)) return;
    }

    // Walk text nodes inside the span, but not inside existing links
    const walker = document.createTreeWalker(
      span,
      NodeFilter.SHOW_TEXT,
      node => node.parentElement && node.parentElement.closest("a")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
    );

    const nodes = [];
    let t; while ((t = walker.nextNode())) nodes.push(t);

    nodes.forEach(node => {
      for (const [name, url] of Object.entries(authorMap)) {
        let current = node;
        // Keep scanning this node's "tail" for multiple matches
        while (current) {
          const i = current.data.indexOf(name);
          if (i === -1) break;

          // current -> [beforeMatch][match][afterMatch]
          const matchStart = current.splitText(i);
          const afterMatch = matchStart.splitText(name.length);

          const a = document.createElement("a");
          a.href = url;
          a.textContent = name;

          // Replace the matched text node with the link (no duplicates)
          matchStart.replaceWith(a);

          // Continue scanning the remainder
          current = afterMatch;
        }
      }
    });
  });
});