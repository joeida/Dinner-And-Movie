
var compute = {

    getZip: function() {
        var zip = $('#zipInput').val().trim();
        var zipValid = /^\d{5}$/;

        if (zip.match(zipValid)) { 
            console.log('valid zip input');
            return zip;
        } else {
            console.log('invalid zip input'); 
        } 

    },

    getSearchCriteria: function() {
        var searchCriteria = $('#searchCriteria').val().trim();
        if (searchCriteria === 'Rating') {
            return 'rating';
        }
        if (searchCriteria === 'Cost') {
            return 'cost';
        }
        if (searchCriteria === 'Distance') {
            return 'real_distance';
        }
    },

    getGeo: function (zip, searchCriteria) {
        var query = zip;
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zip + "&key=AIzaSyBZgPjyk5ho6Axhr_2dU1Ay3M7rU71HXvs";
        $.ajax({url: queryURL, method: 'GET'})
        .then(function(response) {
            var lat = response.results[0].geometry.location.lat;
            var lng = response.results[0].geometry.location.lng;
            var address = response.results[0].formatted_address;
            var addressList = address.split(', ');
            console.log(address);
            console.log(addressList);
            console.log(addressList.length);
            if (addressList.length === 3) {
                var city = addressList[0];
                var state = addressList[1];
                var country = addressList[2];
                console.log('city: ' + city);
                console.log('state: ' + state);
                console.log('country: ' + country);
            }
            var geoObj = {
                lat: lat,
                lng: lng,
                searchCriteria: searchCriteria
            };
            return geoObj;
        })
        .then (function(geoObj) {
            console.log(geoObj);
            compute.getRest(geoObj);
        })
        .fail (function(error) {
            console.log(error);
        });
    },

    getRest: function(geoObj) {
        var lat = geoObj.lat;
        var lng = geoObj.lng;
        var searchCriteria = geoObj.searchCriteria;
        if (geoObj.page === 1) {
            var queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        } else if (geoObj.page === 2) {
            var queryURL = "https://developers.zomato.com/api/v2.1/search?start=21&lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        } else {
            var queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        }
        $.ajax({url: queryURL, method: 'GET'})
        .then(function(response) {
            console.log(response);
            var name;
            var location;
            var cuisine;
            var link;
            console.log(response.restaurants.length);
            for (var i = 0; i < response.restaurants.length; i++) {
                name = response.restaurants[i].restaurant.name;
                location = response.restaurants[i].restaurant.location.address;
                cuisine = response.restaurants[i].restaurant.cuisines;
                link = response.restaurants[i].restaurant.events_url;
                render.displayRest(name, location, cuisine, link);
            }
        });
    }

};

var render = {

    displayRest: function(name, location, cuisine, link) {
        var nameP = $('<p>');
        var locationP = $('<p>');
        var cuisineP = $('<p>');
        var linkA = $('<a>');
        var choiceBtn = $('<button>');
        choiceBtn.addClass('restaurant btn btn-success');
        nameP.text('Restaurant: ' + name);
        locationP.text('Location: ' + location);
        cuisineP.text('Cuisine: ' + cuisine);
        var linkGlyph = $('<span>');
        linkGlyph.addClass('glyphicon glyphicon-info-sign');
        linkA.attr('href', link);
        linkA.attr('target', '_blank');
        linkA.text(' more info');
        linkA.prepend(linkGlyph);
        $('#restaurantTable').append(nameP);
        $('#restaurantTable').append(locationP);
        $('#restaurantTable').append(cuisineP);
        $('#restaurantTable').append(linkA);
    },

    displayRestMap: function(origin, destination) {
        var queryBegin = 'https://www.google.com/maps/embed/v1/directions?key=AIzaSyD5L9bqnVgrw-XfE1nZbhREaDukQJVPDQs&';
        var queryOrigin = 'origin=los+angeles+California&';
        var queryDestination = 'destination=glendale+California&';
        var queryEnd = 'avoid=tolls|highways';
        var queryURL = queryBegin + queryOrigin + queryDestination + queryEnd;
        var iframe = $('<iframe>');
        var blankP = $('<p>');
        iframe.attr('id', 'restaurantMap');
        iframe.attr('width', '450');
        iframe.attr('height', '250');
        iframe.attr('frameborder', '0');
        iframe.attr('style', 'border:0');
        iframe.attr('src', queryURL);
        iframe.attr('allowfullscreen');
        $('#restaurantTable').append(iframe);
        $('#restaurantTable').append(blankP);
    }
};


$('#getRestBtn').on('click', function() {

    var zip = compute.getZip();
    var searchCriteria = compute.getSearchCriteria();
    console.log(searchCriteria);
    compute.getGeo(zip, searchCriteria);
    console.log(zip);

    return false;

});