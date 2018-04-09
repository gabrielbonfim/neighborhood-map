$(window).on('load', function() {
    
    // Menu toggle control
    var menu_extend = true;
    
    // Markers array
    var markers = [];
    
    // Markers icons
    var defaultIcon = makeMarkerIcon('f74');
    var highlightedIcon = makeMarkerIcon('fc2');
    var selectedIcon = makeMarkerIcon('48f');
    
    // List colors
    var listDefaultColor = '#888';
    var listHighlightedItem = '#fc2';
    var listSelectedColor = '#48f';
    
    // InfoWindow
    var largeInfowindow = new google.maps.InfoWindow();
    
    // Foursquare
    var foursquareClientID = '&client_id=VYVSRAZ1IH132F1IAVYYQUKOK4GDVZTOLUQ255KZ4PKQKDSE';
    var foursquareClientSecret = '&client_secret=IJCC1TGSYWRSN0TDZIEDNP5DGS0UXKG5XQFUNQVART30NYRV';
    var foursquareLinkSearch = 'https://api.foursquare.com/v2/venues/search?ll=';
    var foursquareLinkDetails = 'https://api.foursquare.com/v2/venues/';
    var foursquareVersion = '&v=20180323';
    
    // Toggles menu
    $('#map-top-bar-menu').click(function() {
        if(menu_extend) {
            $('.sidenav').css('margin-left', '-350px');
            menu_extend = false;
        } else {
            $('.sidenav').css('margin-left', '0px');
            menu_extend = true;
        }
    });
    
    // Filtering the list on the side menu, updates the visible markers
    $('#places-list').on('DOMSubtreeModified', function() {
        setOnMap();
    });
    
    // Updates marker color on mouse over    
    $('.place').mouseover(function() {
        if(!$(this).hasClass('selected')) {
            var id = $(this).attr('id');
            $(this).css('color', listHighlightedItem);
            markers[id].setIcon(highlightedIcon);
        }
    });
    
    // Updates marker color on mouse leave
    $('.place').mouseleave(function() {
        if(!$(this).hasClass('selected')) {
            var id = $(this).attr('id');
            $(this).css('color', listDefaultColor);
            markers[id].setIcon(defaultIcon);
        }
    });
    
    // Updates marker color on click
    window.markerClick = function(li) {
        var id = li['id'];
        setAllToDefault();
        // Adds class 'selected' used to ignore mouseover and mouse leave
        // when selected
        $('#' + id).addClass('selected');
        $('#' + id).css('color', listSelectedColor);
        markers[id].setIcon(selectedIcon);
        populateInfoWindow(markers[id], largeInfowindow);
    };
    
    // Sets all markers to the default icon and list to the default color
    function setAllToDefault() {
        markers.forEach(function(item) {
            item.setIcon(defaultIcon);
        });
        $('.place').css('color', listDefaultColor);
        $('.place').removeClass('selected');
    }
    
    // Called initially to create an array with the markers locations
    function setLocations() {
        var geocoder = new google.maps.Geocoder();
        $('.place').each(function() {
            var id = $(this).attr('id');
            geocoder.geocode({address: $(this).text()}, function(results, status) {
                if (status === 'OK') {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        icon: defaultIcon,
                        id: id
                    });
                    // Add venueId to the marker
                    setVenueID(id, results[0].geometry.location.toString());
                    markers[id] = marker;
                    marker.addListener('mouseover', function() {
                        if (largeInfowindow.marker != marker) {
                            this.setIcon(highlightedIcon);
                        }
                    });
                    marker.addListener('mouseout', function() {
                        if (largeInfowindow.marker != marker) {
                            this.setIcon(defaultIcon);
                        }
                    });
                    marker.addListener('click', function() {
                        setAllToDefault();
                        this.setIcon(selectedIcon);
                        populateInfoWindow(this, largeInfowindow);
                    });
                } else {
                      alert('Geocode was not successful for the following reason: ' + status);
                }
                    });
        });
    }
    
    // Sets venue id for the marker
    function setVenueID(id, pos) {
        pos = pos.replace('(', '');
        pos = pos.replace(')', '');
        $.getJSON(foursquareLinkSearch + pos + foursquareClientID + foursquareClientSecret + foursquareVersion,
        function(data) {
            markers[id].set('venueId', data.response.venues[0].id);
        }).fail(function() {
            alert('Error fetching the venues IDs. No information will be displayed in the info windows of the locations');
        });
    }
    
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            foursquareContent(infowindow, marker.get('venueId'));
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                setAllToDefault();
            });
            infowindow.open(map, marker);
        }
    }
    
    // Content from Foursquare to populate the marker infoWindow
    function foursquareContent(infowindow, venueId) {
        infowindow.setContent('');
        $.getJSON(foursquareLinkDetails + venueId + '?' + foursquareClientID + foursquareClientSecret + foursquareVersion,
        function(data) {
            var content = '';
            var venue = data.response.venue;
            content += '<img id="logo_foursquare_small" src="img/foursquare_small.png" alt="Foursquare logo small">';
            content += '<h3>' + venue.name + '</h3>';
            content += '<img src="' + venue.bestPhoto.prefix + '250x250' +  venue.bestPhoto.suffix + '" alt="Location Photo"><br>';
            content += '<br><span>' + venue.location.formattedAddress[0] + '</span><br><span>' + venue.location.formattedAddress[1]; + '</span>';
            if(venue.url) {
                content += '<hr><a href="' + venue.url + '" target="_blank">' + venue.url + '</a>';
            } else {
                content += '<hr><span>No Website</span>';
            }
            infowindow.setContent(content);
        }).fail(function() {
            alert('Error fetching location details');
        });
    }
    
    // Creates on the map the actual location on the side bar list
    window.setOnMap = function() {
        try {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            $('.place').each(function() {
                var id = $(this).attr('id');
                markers[id].setMap(map);
            });
        } catch(e) {
            
        }
    }
    
    // Takes as input the color for the marker, and returns a marker with that color
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(20, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(20, 34));
        return markerImage;
    }
    
    setLocations();
});