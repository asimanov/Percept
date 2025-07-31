$(document).ready(function(){
    getCurrentYear();
  
/* <![CDATA[ */
( function( $ ) {
    $( 'a[href="#"]' ).click( function(e) {
        e.preventDefault();
    } );
} )( jQuery );
/* ]]> */
});

document.documentElement.style
.setProperty('--add-font-sans', 'Roboto');

document.documentElement.style
.setProperty('--add-font-serif', 'Merriweather');

document.documentElement.style
.setProperty('--add-font-mono', 'Cousine');


// document.documentElement.style
// .setProperty('--set-color-primary', '#e41d3d');

// document.documentElement.style
// .setProperty('--set-color-primary-tint', '#f2938c');

// document.documentElement.style
// .setProperty('--set-color-primary-shade', '#8b1303');

// document.documentElement.style
// .setProperty('--set-color-secondary', '#005ea2');

// document.documentElement.style
// .setProperty('--set-color-secondary-tint', '#73b3e7');

// document.documentElement.style
// .setProperty('--set-color-secondary-shade', '#162e51');

// document.documentElement.style
// .setProperty('--link-style-color', 'var(--set-color-secondary)');

// Get current year
// 
function getCurrentYear() {
    $("#getCurrentYear").html(new Date().getFullYear());
}