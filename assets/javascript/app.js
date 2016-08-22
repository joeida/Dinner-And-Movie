// Initialize Firebase
var config = {
    apiKey: "AIzaSyChEpHft8Prp9izbllvR5Ilkkedq7XLvXE",
    authDomain: "dinner-and-movie.firebaseapp.com",
    databaseURL: "https://dinner-and-movie.firebaseio.com",
    storageBucket: "dinner-and-movie.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

// Compute Values
var compute = {

    startAddress: '',
    resultCounter: 1,

    // Get address in form of street, city, and state and return address object
    getAddress: function() {
        var addressSentence = $('#address').val().trim();
        if (addressSentence) {
            var addressList = addressSentence.split(' ');
        } else {
            var addressList = '';
        }
        var city = $('#city').val().trim();
        var state = $('#state').val().trim();
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

    // Get zip code, verify format, and return appropriate value
    getZip: function() {
        var zip = $('#zip').val().trim();
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

    // Translate chosen search criteria into required value needed in API to sort results correctly
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

    // Using address and search criteria, use Google Geo API to get Latitude and Longitude of location chosen
    // After results obtained, run get Restaurant method which queries zomato restaurant search API based on geo location
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

    // Using zomato API, obtain list of restaurants based on geo coordinates in lattitude and longitude
    // Display results onto page output location
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

// Output data onto html page
var render = {

    // Display list of restaurants on restaurant output location in html
    displayRest: function(name, location, cuisine, rating, priceRange, link) {
        var nameP = $('<p>');
        var locationP = $('<p>');
        var cuisineP = $('<p>');
        var ratingP = $('<p>');
        var priceRangeP = $('<p>');
        var linkA = $('<a>');
        var choiceBtn = $('<button>');
        var blankP = $('<p>');
        choiceBtn.addClass('addRestaurant green darken-1 btn');
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
        var linkGlyph = $('<i>');
        linkGlyph.addClass('small material-icons');
        linkGlyph.text('info_outline');
        linkA.attr('href', link);
        linkA.attr('target', '_blank');
        linkA.text(' more info ');
        linkA.prepend(linkGlyph);
        $('#restaurantOutput').append(nameP);
        $('#restaurantOutput').append(locationP);
        $('#restaurantOutput').append(cuisineP);
        $('#restaurantOutput').append(ratingP);
        $('#restaurantOutput').append(priceRangeP);
        $('#restaurantOutput').append(linkA);
        $('#restaurantOutput').append(choiceBtn);
        $('#restaurantOutput').append(blankP);
    },

    // Display google map of initial query location to location of chosen restaurant
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

    // Display google map of location of restaurant chosen when no initial location is available
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

    // Display chosen restaurant in itinerary output field on html page
    displayRestChoice: function(name, location, cuisine, rating, priceRange, link) {
        var nameP = $('<p>');
        var locationP = $('<p>');
        var cuisineP = $('<p>');
        var ratingP = $('<p>');
        var priceRangeP = $('<p>');
        var linkA = $('<a>');
        var choiceBtn = $('<button>');
        var blankP = $('<p>');
        choiceBtn.addClass('removeRest red lighten-1 btn');
        choiceBtn.text('Remove From Itinerary');
        nameP.text('Restaurant: ' + name);
        locationP.text('Location: ' + location);
        cuisineP.text('Cuisine: ' + cuisine);
        ratingP.text('User Rating: ' + rating);
        priceRangeP.text('Price Range: ' + priceRange);
        var linkGlyph = $('<i>');
        linkGlyph.addClass('small material-icons');
        linkGlyph.text('info_outline');
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

    // Clear input fields after submitting request
    clearInput: function() {
        $('#address').val("");
        $('#city').val("");
        $('#state').val("");
        $('#zip').val("");
    },

    // Clear list of restaurants in html before each list render
    clearRestTable: function() {
        $('#restaurantOutput').empty();
    },

    // Clear itinerary restaurant choice field before each output render
    clearRestChoice: function() {
        $('#restChoiceOutput').empty();
    },

    // Clear map output field before each map render
    clearMapOutput: function() {
        $('#mapOutput').empty();
    }

};

var db = {
    // Write restaurant object to database restaurant reference object
    setRest: function(restObj) {
        database.ref('/restaurant').set(restObj);
    },

    // Cause database change on page load to initiate map render
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

    // Remove restaurant object from database upon clicking the restaurant remove button in itinerary
    removeRest: function() {
        database.ref('/restaurant').remove();
    }
};


$(document).ready(function() {

    // Process address input upon clicking the submit button
    $('#submit').on('click', function() {

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

    // Process add restaurant button upon clicking on the specific restaurant in generated restaurant list
    $('#restaurantOutput').on('click', '.addRestaurant', function() {
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

    // Process remove restaurant button upon clicking on the specific restaurant in the generated restaurant itinerary location
    $('#restChoiceOutput').on('click', '.removeRest', function() {
        db.removeRest();
        render.clearMapOutput();
    });

    // Process values upon changes in the restaurant database reference object
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

// SELECT
    $('select').material_select();

// CAROUSEL
    $('.carousel').carousel();
    $('.carousel-slider').slider({full_width: true});

 // MODAL
    $('.modal-trigger').leanModal();
});
          
$('#modal1').openModal();
$('#modal1').closeModal();

// SMOOTH SCROLLING
$(function() {
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
            $('html, body').animate({
            scrollTop: target.offset().top
                }, 1000);
            return false;
            }
        }
    });
});
