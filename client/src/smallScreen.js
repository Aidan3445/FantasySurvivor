/*
Please note this value should match 
the media query in index.css
As far as I can tell there is no way 
to automatically pass variables to media queries
*/
var smallScreen = window.innerWidth < 800;
export { smallScreen };