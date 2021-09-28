import * as FEM from "./FEM.js";
import config from './config.js'; 

// let header = document.getElementById( 'renderer-output' );
let wrapper = document.getElementById('wrapper');
let sidebarCollapse = document.getElementById('sidebarCollapse');
let sidebar = document.getElementById('sidebar');
let sidebarSettings = document.getElementById('sidebar-settings');
// let footer = document.getElementById('footer');
let darkmode = document.getElementById('dark-mode');
let settings = document.getElementById('settings');

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
    // activate dark mode
    wrapper.classList.toggle('dark-mode');

    // change background dinamically
    if ( wrapper.classList.contains('dark-mode') ) {
	FEM.setBackgroundColor( config[ 'background.dark.topColor' ], config[ 'background.dark.bottomColor' ] );
	FEM.setPlaneColor( config[ 'ground.plane.dark.color' ] );
	FEM.setGrid( config[ 'ground.grid.dark.major' ], config[ 'ground.grid.dark.minor' ] );
    } else {
	FEM.setBackgroundColor( config[ 'background.light.topColor' ], config[ 'background.light.bottomColor' ] );
	FEM.setPlaneColor( config[ 'ground.plane.light.color' ] );
	FEM.setGrid( config[ 'ground.grid.light.major' ], config[ 'ground.grid.light.minor' ] );
    }
});
// header.addEventListener('click', function() {
//     alert(' holi'); 
// });

// settings
settings.addEventListener('click', function() {
    // open right sidebar
    sidebarSettings.classList.toggle('active');
});


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
