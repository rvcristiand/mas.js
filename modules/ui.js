let sidebarCollapse = document.getElementById('sidebarCollapse');
let sidebar = document.getElementById('sidebar');

// sidebar  
sidebarCollapse.addEventListener('click', function () {
    
    // open sidebar
    sidebar.classList.toggle('active');
    // fade in the overlay
    // overlay.classList.add('active');
    // $('.collapse.in').toggleClass('in');
    // $('a[aria-expanded=true]').attr('aria-expanded', 'false');
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
