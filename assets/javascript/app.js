// Initialize Firebase
var config = {
    apiKey: "AIzaSyChEpHft8Prp9izbllvR5Ilkkedq7XLvXE",
    authDomain: "dinner-and-movie.firebaseapp.com",
    databaseURL: "https://dinner-and-movie.firebaseio.com",
    storageBucket: "dinner-and-movie.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

var compute = {

    startAddress: '',
    resultCounter: 1,

    getAddress: function() {
        var addressSentence = $('#addressInput').val().trim();
        if (addressSentence) {
            var addressList = addressSentence.split(' ');
        } else {
            var addressList = '';
        }
        var city = $('#cityInput').val().trim();
        var state = $('#stateInput').val().trim();
        if (addressList === '' && city === '' && state === '') {
            return 'empty';
        } else {
            var addressObj = {
                addressList: addressList,
                city: city,
                state: state
            };
            return addressObj;
        }
    },

    getZip: function() {
        var zip = $('#zipInput').val().trim();
        var zipValid = /^\d{5}$/;
        if (zip.match(zipValid)) { 
            var zipObj = {
                zip: zip
            };
            return zipObj;
        } else if (zip === '') {
            return 'empty';
        } else {
            return 'invalid';
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
        var zip = addressObj.zip;

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
        if (zip) {
            queryList.push(zip);
        }
        query = queryList.join(',+');
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + query + "&key=AIzaSyBZgPjyk5ho6Axhr_2dU1Ay3M7rU71HXvs";
        $.ajax({url: queryURL, method: 'GET'})
        .then(function(response) {
            var lat = response.results[0].geometry.location.lat;
            var lng = response.results[0].geometry.location.lng;
            var address = response.results[0].formatted_address;
            compute.startAddress = address;
            db.setRestOnLoad();
            var addressList = address.split(', ');
            var geoObj = {
                lat: lat,
                lng: lng,
                searchCriteria: searchCriteria
            };
            return geoObj;
        })
        .then (function(geoObj) {
            compute.getRest(geoObj);
        })
        .fail (function(error) {
            console.log(error);
        });
    },

    getRest: function(geoObj, newQueryURL) {
        var lat = geoObj.lat;
        var lng = geoObj.lng;
        var searchCriteria;
        var queryURL;
        if (geoObj.searchCriteria) {
            searchCriteria = geoObj.searchCriteria;
        } else {
            searchCriteria = 'rating';
        }
        if (newQueryURL) {
            queryURL = newQueryURL;
        } else {
            queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
        }
        $.ajax({url: queryURL, method: 'GET'})
        .then(function(response) {
            var name;
            var location;
            var cuisine;
            var rating;
            var priceRange;
            var link;
            for (var i = 0; i < response.restaurants.length; i++) {
                name = response.restaurants[i].restaurant.name;
                location = response.restaurants[i].restaurant.location.address;
                cuisine = response.restaurants[i].restaurant.cuisines;
                rating = response.restaurants[i].restaurant.user_rating.aggregate_rating;
                priceRange = response.restaurants[i].restaurant.price_range;
                link = response.restaurants[i].restaurant.url;
                render.displayRest(name, location, cuisine, rating, priceRange, link);
            }
            if (response.restaurants.length === 20 && compute.resultCounter < 22) {
                compute.resultCounter += 20;
                var newQuery = "https://developers.zomato.com/api/v2.1/search?start=" + compute.resultCounter + "&lat=" + lat + "&lon=" + lng + "&radius=1000&sort=" + searchCriteria + "&apikey=4e48375b934f553b68f4409de5bdf9bb";
                compute.getRest(geoObj, newQuery);
            } else {
                compute.resultCounter = 1;
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

    displayRestDistanceMap: function(origin, destination) {
        render.clearMapOutput();
        var queryBegin = 'https://www.google.com/maps/embed/v1/directions?key=AIzaSyD5L9bqnVgrw-XfE1nZbhREaDukQJVPDQs&';
        var queryOrigin = 'origin=' + origin.split(', ').join('+') + '&';
        var destinationList = destination.split(', ').join('+');
        var queryDestination = 'destination=' + destinationList.split(' ').join('+') + '&';
        var queryEnd = 'avoid=tolls|highways';
        var queryURL = queryBegin + queryOrigin + queryDestination + queryEnd;
        var iframe = $('<iframe>')
        var blankP = $('<p>');
        iframe.attr('id', 'restaurantMap');
        iframe.attr('width', '450');
        iframe.attr('height', '250');
        iframe.attr('frameborder', '0');
        iframe.attr('style', 'border:0');
        iframe.attr('src', queryURL);
        iframe.attr('allowfullscreen');
        $('#mapOutput').append(iframe);
        $('#mapOutput').append(blankP);
    },

    displayRestMap: function(destination) {
        render.clearMapOutput();
        var queryBegin = 'https://www.google.com/maps/embed/v1/search?key=AIzaSyD5L9bqnVgrw-XfE1nZbhREaDukQJVPDQs&q='
        var destinationList = destination.split(', ').join('+');
        var queryDestination = destinationList.split(' ').join('+');
        var queryURL = queryBegin + queryDestination;
        var iframe = $('<iframe>')
        var blankP = $('<p>');
        iframe.attr('id', 'restaurantMap');
        iframe.attr('width', '450');
        iframe.attr('height', '250');
        iframe.attr('frameborder', '0');
        iframe.attr('style', 'border:0');
        iframe.attr('src', queryURL);
        iframe.attr('allowfullscreen');
        $('#mapOutput').append(iframe);
        $('#mapOutput').append(blankP);
    },

    displayRestChoice: function(name, location, cuisine, rating, priceRange, link) {
        var nameP = $('<p>');
        var locationP = $('<p>');
        var cuisineP = $('<p>');
        var ratingP = $('<p>');
        var priceRangeP = $('<p>');
        var linkA = $('<a>');
        var choiceBtn = $('<button>');
        var blankP = $('<p>');
        choiceBtn.addClass('removeRest btn btn-sm btn-danger');
        choiceBtn.text('Remove From Itinerary');
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
        $('#restChoiceOutput').append(nameP);
        $('#restChoiceOutput').append(locationP);
        $('#restChoiceOutput').append(cuisineP);
        $('#restChoiceOutput').append(ratingP);
        $('#restChoiceOutput').append(priceRangeP);
        $('#restChoiceOutput').append(linkA);
        $('#restChoiceOutput').append(choiceBtn);
        $('#restChoiceOutput').append(blankP);
    },

    clearInput: function() {
        $('#addressInput').val("");
        $('#cityInput').val("");
        $('#stateInput').val("");
    },

    clearRestTable: function() {
        $('#restaurantTable').empty();
    },

    clearRestChoice: function() {
        $('#restChoiceOutput').empty();
    },

    clearMapOutput: function() {
        $('#mapOutput').empty();
    }

};

var db = {
    setRest: function(restObj) {
        database.ref('/restaurant').set(restObj);
    },

    setRestOnLoad: function () {
        database.ref('/restaurant').once("value", function(snapshot) {
            if (snapshot.val() !== null) {
                var name = snapshot.val().name;
                var location = snapshot.val().location;
                var cuisine = snapshot.val().cuisine;
                var rating = snapshot.val().rating;
                var priceRange = snapshot.val().priceRange;
                var link = snapshot.val().link;
                var restClearObj = {
                    name: name,
                    location: location,
                    cuisine: cuisine,
                    rating: rating,
                    priceRange: priceRange,
                };
                var restObj = {
                    name: name,
                    location: location,
                    cuisine: cuisine,
                    rating: rating,
                    priceRange: priceRange,
                    link: link
                };
                database.ref('/restaurant').set(restClearObj);
                database.ref('/restaurant').set(restObj);
            }
        });
    },

    removeRest: function() {
        database.ref('/restaurant').remove();
    }
};


$('#getRestBtn').on('click', function() {

    render.clearRestTable();
    var addressObj = compute.getAddress();
    var zipObj = compute.getZip();
    var searchCriteria = compute.getSearchCriteria();
    if (zipObj === 'invalid') {
        console.log('invalid zip code');
    } else if (zipObj === 'empty' && addressObj === 'empty') {
        console.log('zip code and address field empty');
    } else if (zipObj && typeof zipObj === 'object') {
        render.clearInput();
        compute.getGeo(zipObj, searchCriteria);
    } else {
        render.clearInput();
        compute.getGeo(addressObj, searchCriteria);
    }

    return false;

});

$('#restaurantTable').on('click', '.addRestaurant', function() {
    var name = $(this).attr('data-name');
    var location = $(this).attr('data-location');
    var cuisine = $(this).attr('data-cuisine');
    var rating = $(this).attr('data-rating');
    var priceRange = $(this).attr('data-priceRange');
    var link = $(this).attr('data-link');
    var restObj = {
        name: name,
        location: location,
        cuisine: cuisine,
        rating: rating,
        priceRange: priceRange,
        link: link
    };
    db.setRest(restObj);
});

$('#restChoiceOutput').on('click', '.removeRest', function() {
    db.removeRest();
    render.clearMapOutput();
});

database.ref('/restaurant').on("value", function(snapshot) {
    if (snapshot.val() !== null) {
        render.clearRestChoice();
        var name = snapshot.val().name;
        var location = snapshot.val().location;
        var cuisine = snapshot.val().cuisine;
        var rating = snapshot.val().rating;
        var priceRange = snapshot.val().priceRange;
        var link = snapshot.val().link;
        render.displayRestChoice(name, location, cuisine, rating, priceRange, link);
        if (compute.startAddress) {
            render.displayRestDistanceMap(compute.startAddress, location);
        } else {
            render.displayRestMap(location);
        }
    } else {
        render.clearRestChoice();
        render.clearMapOutput();
    }
});

