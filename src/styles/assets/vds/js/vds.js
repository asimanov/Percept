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

        [].map.call(document.querySelectorAll('.vds-kitchen-sink-nav'), function(el) {
            el.classList.toggle('vds-kitchen-sink-nav--active');
        });

        [].map.call(document.querySelectorAll('.vds-kitchen-sink-content'), function(el) {
            el.classList.toggle('vds-kitchen-sink-content--active');
        });

        [].map.call(document.querySelectorAll('.menu i'), function(el) {
            el.classList.toggle('fa-times');
        });

        [].map.call(document.querySelectorAll('.vds-body'), function(el) {
            el.classList.toggle('no-scroll');
        });
        
    });
    
    document.querySelector('.vds-kitchen-sink-content').addEventListener('click', function(e) {

        [].map.call(document.querySelectorAll('.vds-kitchen-sink-nav'), function(el) {
            el.classList.remove('vds-kitchen-sink-nav--active');
        });

        [].map.call(document.querySelectorAll('.vds-kitchen-sink-content'), function(el) {
            el.classList.remove('vds-kitchen-sink-content--active');
        });

        [].map.call(document.querySelectorAll('.menu i'), function(el) {
            el.classList.remove('fa-times');
        });

        [].map.call(document.querySelectorAll('.vds-body'), function(el) {
            el.classList.remove('no-scroll');
        });
        
    });

}