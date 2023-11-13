/*
Please note this value should match 
the media queries in index.css
As far as I can tell there is no way 
to automatically pass variables to media queries
*/
const largeScreen = window.innerWidth < 1260;
const mediumScreen = window.innerWidth < 975;
const smallScreen = window.innerWidth < 775;
const tinyScreen = window.innerWidth < 535;

export { largeScreen, mediumScreen, smallScreen, tinyScreen };
