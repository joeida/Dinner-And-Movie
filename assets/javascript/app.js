
var compute = {

    getAddress: function() {
        var addressSentence = $('#addressInput').val().trim();
        var addressList = addressSentence.split(' ');
        var city = $('#cityInput').val().trim();
        var state = $('#stateInput').val().trim();
        var addressObj = {
            addressList: addressList,
            city: city,
            state: state
        }
        return addressObj;
    },

    checkZip: function() {
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

    getGeo: function (addressObj, searchCriteria) {
        var query = '';
        var queryList = [];
        var addressList = addressObj.addressList;
        var city = addressObj.city;
        var state = addressObj.state;
        if (addressList) {
            var addressQuery = addressList.join('+');
            queryList.push(addressQuery);
        }
        if (city) {
            queryList.push(city);
        }
        if (state) {
            queryList.push(state);
        }
        query = queryList.join(',+');
        console.log(query);
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + query + "&key=AIzaSyBZgPjyk5ho6Axhr_2dU1Ay3M7rU71HXvs";
        console.log(queryURL);
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
            if (addressList.length === 4) {
                var street = addressList[0];
                var city = addressList[1];
                var state = addressList[2];
                var country = addressList[3];
                console.log('street: ' + street);
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
        var searchCriteria;
        if (geoObj.searchCriteria) {
            searchCriteria = geoObj.searchCriteria;
        } else {
            searchCriteria = 'rating';
        }
        console.log(lat, lng, searchCriteria);
        // if (geoObj.page === 2) {
        //     var queryURL = "https://developers.zomato.com/api/v2.1/search?start=21&lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        // }
        var queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        $.ajax({url: queryURL, method: 'GET'})
        .then(function(response) {
            console.log(response);
            var name;
            var location;
            var cuisine;
            var rating;
            var priceRange;
            var link;
            console.log(response.restaurants.length);
            for (var i = 0; i < response.restaurants.length; i++) {
                name = response.restaurants[i].restaurant.name;
                location = response.restaurants[i].restaurant.location.address;
                cuisine = response.restaurants[i].restaurant.cuisines;
                rating = response.restaurants[i].restaurant.user_rating.aggregate_rating;
                priceRange = response.restaurants[i].restaurant.price_range;
                link = response.restaurants[i].restaurant.url;
                render.displayRest(name, location, cuisine, rating, priceRange, link);
            }
        });
    }

};

var render = {

    displayRest: function(name, location, cuisine, rating, priceRange, link) {
        var nameP = $('<p>');
        var locationP = $('<p>');
        var cuisineP = $('<p>');
        var ratingP = $('<p>');
        var priceRangeP = $('<p>');
        var linkA = $('<a>');
        var choiceBtn = $('<button>');
        var blankP = $('<p>');
        choiceBtn.addClass('addRestaurant btn btn-sm btn-success');
        choiceBtn.attr('data-name', name);
        choiceBtn.attr('data-location', location);
        choiceBtn.attr('data-cuisine', cuisine);
        choiceBtn.attr('data-rating', rating);
        choiceBtn.attr('data-priceRange', priceRange);
        choiceBtn.attr('data-link', link);
        choiceBtn.text('Add to Itinerary');
        nameP.text('Restaurant: ' + name);
        locationP.text('Location: ' + location);
        cuisineP.text('Cuisine: ' + cuisine);
        ratingP.text('User Rating: ' + rating);
        priceRangeP.text('Price Range: ' + priceRange);
        var linkGlyph = $('<span>');
        linkGlyph.addClass('glyphicon glyphicon-info-sign');
        linkA.attr('href', link);
        linkA.attr('target', '_blank');
        linkA.text(' more info ');
        linkA.prepend(linkGlyph);
        $('#restaurantTable').append(nameP);
        $('#restaurantTable').append(locationP);
        $('#restaurantTable').append(cuisineP);
        $('#restaurantTable').append(ratingP);
        $('#restaurantTable').append(priceRangeP);
        $('#restaurantTable').append(linkA);
        $('#restaurantTable').append(choiceBtn);
        $('#restaurantTable').append(blankP);
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
    },

};


$('#getRestBtn').on('click', function() {

    var addressObj = compute.getAddress();
    var searchCriteria = compute.getSearchCriteria();
    console.log(addressObj);
    console.log(searchCriteria);
    compute.getGeo(addressObj, searchCriteria);

    return false;

});

$('#restaurantTable').on('click', '.addRestaurant', function() {
    var name = $(this).attr('data-name');
    var location = $(this).attr('data-location');
    var cuisine = $(this).attr('data-cuisine');
    var rating = $(this).attr('data-rating');
    var priceRange = $(this).attr('data-priceRange');
    var link = $(this).attr('data-link');
    console.log(name);
    console.log(location);
    console.log(cuisine);
    console.log(rating);
    console.log(priceRange);
    console.log(link);
});



