/**
 * Demo.js
 * Javascript file for O3 scss library demo
 **/



$(document).ready(function(){

    /**
     * HTML escaper
     **/

    $('code').each(function(){
        var code = $(this).html();
        $(this).text(code);
    });

    
    /**
     * loading bar
     **/

    $('.js-show-hide-loading-bar').click(function(){
      showHideLoadingBar();
      return false;
    });

    function showHideLoadingBar(){
        if ($('.loading-bar').length === 0) { 
            $( 'body').append( "<div class='loading-bar'></div>" );
        }
        setTimeout(function(){ 
            $('.loading-bar').fadeOut(function(){
                $('.loading-bar').remove();
            });
        }, 3000);
    }


    /**
     * Loading spinner
     **/

    $('.js-show-hide-loading-spinner').click(function(){
      showHideLoadingSpinner();
      return false;
    });
    function showHideLoadingSpinner(){
        if ($('.loading-spinner').length === 0) { 
            $('body').append( "<div class='loading-spinner'><span></span><span></span><span></span><span></span></div><div class='loading-spinner-bg'></div>");
        }
        setTimeout(function(){ 
            $('.loading-spinner').fadeOut(
                function(){
                    $( '.loading-spinner').remove();
                    $( '.loading-spinner-bg').remove();
            });
           
        }, 3000);
    }
});


;(function() {

  'use strict';

  var i,
    $description    = document.querySelector('.description'),
    $download     = document.querySelector('.download'),
    $popoverLinks   = document.querySelectorAll('[data-popover]'),
    $popovers     = document.querySelectorAll('.popover'),
    $codeSnippets   = document.querySelectorAll('.code-content'),
    $shareButtons   = document.querySelectorAll('.share-dialog'),
    $anchors      = document.querySelectorAll('a'),
    request       = new XMLHttpRequest(),
    entityMapObject   = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': '&quot;', "'": '&#39;', "/": '&#x2F;' };

  function init() {
    for (i = 0; i < $popoverLinks.length; i++) $popoverLinks[i].addEventListener('click', openPopover);
    document.addEventListener('click', closePopover);
    buildSnippets();
    getVersion();
    googleAnalytics();
    shareDialog();
    localhost();
  }

  function closePopover(e) {
    for (i = 0; i < $popovers.length; i++) $popovers[i].classList.remove('popover-open');
  }

  function openPopover(e) {
    e.preventDefault();
    if (document.querySelector(this.getAttribute('href')).classList.contains('popover-open')) {
      document.querySelector(this.getAttribute('href')).classList.remove('popover-open');
    }
    else {
      closePopover();
      document.querySelector(this.getAttribute('href')).classList.add('popover-open');
    }
    e.stopImmediatePropagation();
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s) {
      return entityMapObject[s];
    });
  }

  function buildSnippets() {
    for (i = 0; i < $codeSnippets.length; i++) $codeSnippets[i].innerHTML = escapeHtml($codeSnippets[i].innerHTML);
  }

  function getVersion() {
    if ($description || $download) {
      request.open('GET', '//raw.githubusercontent.com/milligram/milligram/master/package.json', true);
      request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
          var version = JSON.parse( this.response ).version;
          if ($description) $description.innerHTML = $description.innerHTML+' <br><i><small>Currently v'+version+'</small></i>';
          $download.setAttribute('href', 'https://github.com/milligram/milligram/archive/v'+version+'.zip');
        }
        else {
          console.log( '// There was a connection error of some sort' );
        }
      };
      request.send();
    }
  }

  init();

}());