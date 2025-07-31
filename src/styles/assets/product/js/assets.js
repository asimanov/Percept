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

// $(document).ready(function() {
//     if ($('.navigation-list').hasClass("active")) {
//         $('.has-action').addClass('balls');
//     } else {
//         $('.has-action').removeClass('balls');
//     }
// });

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

// Page Anim
// 
// var HideShowTransition = Barba.BaseTransition.extend({
//   start: function() {
//     this.newContainerLoading.then(this.finish.bind(this));
//   },

//   finish: function() {
//     document.body.scrollTop = 0;
//     this.done();
//   }
// }); 

// Barba.Pjax.getTransition = function() {
//   return HideShowTransition;
// };

// Google Analytics
// 
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-42277328-3', 'auto');
ga('send', 'pageview'); 