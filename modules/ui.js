import * as FEM from "./FEM.js";
import config from './config.js'; 


// DOM //
// let header = document.getElementById( 'renderer-output' );
let wrapper = document.getElementById( 'wrapper' );
let sidebarCollapse = document.getElementById( 'sidebarCollapse' );
let sidebar = document.getElementById( 'sidebar' );
let sidebarSettings = document.getElementById( 'sidebar-settings' );
// let footer = document.getElementById('footer');
let darkmode = document.getElementById( 'dark-mode' );
let settings = document.getElementById( 'settings' );

// user custom values //
let theme = localStorage.getItem( 'theme' ) || 'light';



window.addEventListener( 'DOMContentLoaded', () => {
    // wrapper
    if ( theme == 'light' ) {
	wrapper.classList.remove( 'dark-mode' );
    } else {
	wrapper.classList.add( 'dark-mode' );
    }
});

// sidebar  
sidebarCollapse.addEventListener('click', function () {    
    // open sidebar
    sidebar.classList.toggle('active');
    
    // fade in the overlay
    // overlay.classList.add('active');
    // $('.collapse.in').toggleClass('in');
    // $('a[aria-expanded=true]').attr('aria-expanded', 'false');
});

// dark-mode
darkmode.addEventListener('click', function() {
    // set theme status
    theme = theme == 'light' ? 'dark' : 'light';

    // save user custom
    localStorage.setItem( 'theme', theme );

    // set theme
    setTheme( theme );
});

// settings
settings.addEventListener('click', function() {
    // open right sidebar
    sidebarSettings.classList.toggle('active');
});

function setTheme( theme ) {
    // load config //
    var isLight = theme == 'light';

    // background
    var topColor = isLight ? config[ 'background.light.topColor' ] : config[ 'background.dark.topColor' ];
    var bottomColor = isLight ? config[ 'background.light.bottomColor' ] : config[ 'background.dark.bottomColor' ];

    // ground
    var planeColor = isLight ? config[ 'ground.plane.light.color' ] : config[ 'ground.plane.dark.color' ];
    var gridmajorColor = isLight ? config[ 'ground.grid.light.major' ] : config[ 'ground.grid.dark.major' ];
    var gridminorColor = isLight ? config[ 'ground.grid.light.minor' ] : config[ 'ground.grid.dark.minor' ];

    // config setup //
    // wrapper
    if ( isLight ) {
	wrapper.classList.remove( 'dark-mode' );
    } else {
	wrapper.classList.add( 'dark-mode' );
    }

    // FEM.js
    FEM.setBackgroundColor( topColor, bottomColor );
    FEM.setPlaneColor( planeColor );
    FEM.setGrid( gridmajorColor, gridminorColor );
}

// document.addEventListener('DOMContentLoaded', function () {


//         // let overlay = document.getElementById('overlay');


//         // let dismiss = document.getElementById('dismiss');

        
//         // dismiss button
//         dismiss.addEventListener('click', function() {
//           sidebar.classList.remove('active');
//           overlay.classList.remove('active');
//         })

//         overlay.addEventListener('click', function() {
//           overlay.classList.remove('active');
//           sidebar.classList.remove('active');
//         })
//       });
