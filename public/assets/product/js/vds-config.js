document.addEventListener("DOMContentLoaded", function(){
    cssPropWrite();
    getCurrentYear();
    truncate();

/* <![CDATA[ */
( function( $ ) {
    $( 'a[href="#"]' ).click( function(e) {
        e.preventDefault();
    } );
} )( jQuery );
/* ]]> */
});
  
function cssPropWrite() {  
    document.documentElement.style
    .setProperty('--add-font-sans', 'Archivo Black');

    document.documentElement.style
    .setProperty('--add-font-serif', 'PT Sans');

    document.documentElement.style
    .setProperty('--add-font-mono', 'Cousine');
}

function getCurrentYear() {
    $("#getCurrentYear").html(new Date().getFullYear());
}

function truncate() {
    shave('.truncate', 150);
}