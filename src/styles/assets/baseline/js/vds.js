document.addEventListener("DOMContentLoaded", function(){
    cssPropWrite();
    productNav();
});
  
function cssPropWrite() {
    document.documentElement.style
    .setProperty('--add-font-sans', 'Roboto');

    document.documentElement.style
    .setProperty('--add-font-serif', 'Merriweather');

    document.documentElement.style
    .setProperty('--add-font-mono', 'Cousine');
}

function productNav() {

    document.querySelector('.menu').addEventListener('click', function(e) {
        e.preventDefault();

        [].map.call(document.querySelectorAll('.bsln-kitchen-sink-nav'), function(el) {
            el.classList.toggle('bsln-kitchen-sink-nav--active');
        });

        [].map.call(document.querySelectorAll('.bsln-kitchen-sink-content'), function(el) {
            el.classList.toggle('bsln-kitchen-sink-content--active');
        });

        [].map.call(document.querySelectorAll('.menu i'), function(el) {
            el.classList.toggle('fa-times');
        });

        [].map.call(document.querySelectorAll('.bsln-body'), function(el) {
            el.classList.toggle('no-scroll');
        });
        
    });
    
    document.querySelector('.bsln-kitchen-sink-content').addEventListener('click', function(e) {

        [].map.call(document.querySelectorAll('.bsln-kitchen-sink-nav'), function(el) {
            el.classList.remove('bsln-kitchen-sink-nav--active');
        });

        [].map.call(document.querySelectorAll('.bsln-kitchen-sink-content'), function(el) {
            el.classList.remove('bsln-kitchen-sink-content--active');
        });

        [].map.call(document.querySelectorAll('.menu i'), function(el) {
            el.classList.remove('fa-times');
        });

        [].map.call(document.querySelectorAll('.bsln-body'), function(el) {
            el.classList.remove('no-scroll');
        });
        
    });

}