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