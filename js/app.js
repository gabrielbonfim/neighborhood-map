var map = null;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 	38.736946, lng: -9.142695},
        zoom: 14
    });
}

setTimeout(function(){ 
    if(map === null) {
        alert('Error loading map');
    }
}, 3000);