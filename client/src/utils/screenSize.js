/*
Please note this value should match 
the media queries in index.css
As far as I can tell there is no way 
to automatically pass variables to media queries
*/
const mediumScreen = window.innerWidth < 960;
const smallScreen = window.innerWidth < 775;
const tinyScreen = window.innerWidth < 535;

export { mediumScreen, smallScreen, tinyScreen };
