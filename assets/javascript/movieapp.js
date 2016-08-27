
var database = firebase.database();

//Creating needed global variables.
var theaterAddress = "";
var showtime = "";
var movieTitle = "";
var movieTime = "";
var movieTheater = "";
var movieDate = "";
var addressR;
var addressM;
var posterURL;
var lati;
var long;


//API keys for OnConnect.
apiKey1 = "w2v7bscpkzmezeny47ueqsau"
apiKey2 = "93dvq9k3hx7ahh997jb5tyd2"
apiKey3 = "9vu3zjqxjwg49mm9p72mqjau"
apiKey4 = "adf7jebmw23v6yjr6f6qcqsf"

//When enter zip, find movies, clear database, empty anything that was in movieContainer.
//Hide unneeded buttons and containers.
$('#submit').on('click', function(){
	database.ref('/movieOptions').remove();
	$("#movieContainer").empty();

	return false;
});

//When click on movie choice, find showtimes, empty anything that was in showtimeContainer.
//Hide unneeded buttons and containers.
$("#movieContainer").on("click", ".movie", function(){
	var movie = $(this).data(movie);
	$("#showtimeContainer").empty();
	findShowtimes(movie);
	
});

//When click on showtime choice, find address of theater, empty selectionContainer.
//Hide unneeded buttons and containers.
$("#showtimeContainer").on("click", ".showtime", function(){
	var showtime = $(this).data(showtime);
	database.ref('/movieChoice').set({
				title: showtime.title,
				date: showtime.date,
				time: showtime.time,
				theater: showtime.theater,
				userId: userId
			});	
	$("#selectionContainer").empty();
	findAddress(showtime);
	
});


//Take zip code and query OnConnect for movies playing nearby. Store movie info in each button.
//Disply movie info. Also get showtimes for each movie for later display.
function findMovie(lat, lng){
	var date = moment().format("YYYY-MM-DD");
	var onConnectQueryURL = "https://data.tmsapi.com/v1.1/movies/showings?startDate=" + date + "&lat=" + lat + "&lng=" + lng + "&api_key=" + apiKey4;
	$.ajax({url: onConnectQueryURL, method: 'GET'})
	.done(function(response){
		for (var i = 0; i < 25; i++){
			var movie = response[i];
			var movieTitle;
			if (response[i].title){
				movieTitle = response[i].title;
			}
			else {
				movieTitle = "Untitled";
			};
			var movieRating;
			if (response[i].ratings) {
				movieRating = response[i].ratings[0].code;
			}
			else {
				movieRating = "Not Rated";
			};
			
			var shortDescription;
			if (response[i].shortDescription){
				shortDescription = response[i].shortDescription;
			}
			else {
				shortDescription = "No Descripton Listed"
			};
			var cast;
			if (response[i].topCast) {
				cast = response[i].topCast.join(", ");
			}
			else {
				cast = "No Cast Listed";
			};
			var director; 
			if (response[i].directors) {
				director = response[i].directors.join(", ");
			}
			else {
				director = "No Director Listed";
			};
			var longDescription = response[i].longDescription;
			

			var movieButton = $("<button>");
			movieButton.text("Find Showtimes");
			movieButton.addClass("movie");
			movieButton.attr("data-title", movieTitle);
			movieButton.attr("data-shortsummary", shortDescription);
			movieButton.attr("data-cast", cast);
			movieButton.attr("data-director", director);
			movieButton.attr("data-rating", movieRating);
			movieButton.attr("data-summary", longDescription);
			var movieBlock = ("<h3>" + movieTitle + "</h3>Summary: " + shortDescription + "<br>Rating: " + movieRating + "<br>Cast: " + cast + "<br>Director: " + director + "<br>");
			$("#movieContainer").append(movieBlock);
			$("#movieContainer").append(movieButton);

			for (var j = 0; j < 20; j++){
				var showtime;
				if (response[i].showtimes[j]) {
					showtime = response[i].showtimes[j].dateTime;
					var dateTimeArray = showtime.split("T");
					var movieDate = dateTimeArray[0];
					var time = dateTimeArray[1];
					var movieTime = moment(time, 'hh:mm').format("h:mm a");
				}
				else {
					showtime = "No Showtime";
					movieDate = "No Date";
					movieTime = "No Showtime";
				};
				var movieTheater;
				if (response[i].showtimes[j]) {
					movieTheater = response[i].showtimes[j].theatre.name;
				}
				else {
					movieTheater = "No Theater";
				};

				database.ref('/movieOptions').push({
					title: movieTitle,
					date: movieDate,
					time: movieTime,
					theater: movieTheater,
					userId: userId
				});
			};
		};
	});
};

function findShowtimes(movie){			
	var data = database.ref('/movieOptions');
	data.on("child_added", function(snapshot){
		var snapshot = snapshot.val();
		movieTitle = snapshot.title;
		movieDate = snapshot.date;
		movieDate = moment(movieDate, "YYYY-MM-DD").format("dddd, MMMM DD, YYYY");
		movieTime = snapshot.time;
		movieTheater = snapshot.theater;
		if (movieTitle == movie.title){
			var showtimeBlock = $("<h3>" + movieTitle + "</h3>" + movieDate + "<br>" + movieTime + "<br>" + movieTheater + "</br>");
			var showtimeButton = $("<button>");
			showtimeButton.text("Select Showtime");
			showtimeButton.addClass("showtime");
			showtimeButton.attr("data-title", movieTitle);
			showtimeButton.attr("data-theater", movieTheater);
			showtimeButton.attr("data-date", movieDate);
			showtimeButton.attr("data-time", movieTime);
			$("#showtimeContainer").append(showtimeBlock);
			$("#showtimeContainer").append(showtimeButton);
			findPoster(movieTitle);
		};
	});						
};
function findAddress(showtime){	

  	var latlng = new google.maps.LatLng(lati,long);
	var map = new google.maps.Map(document.getElementById('mapdiv'), {
   
    });

	var request = {
    	query: showtime.theater,
    	type: 'movie_theater'
  	};
  	var service = new google.maps.places.PlacesService($('#mapdiv').get(0));
	service.textSearch(request, callbackAddress);
};
		
function callbackAddress(results, status) {
  	if (status == google.maps.places.PlacesServiceStatus.OK) {
    	theaterAddress = results[0].formatted_address;
    	addressM = theaterAddress;
    	displaySelection(theaterAddress);
    };
 };

 function displaySelection(){
 	var choice = database.ref('/movieChoice');
	choice.once("value", function(snapshot){
		db.setRestOnLoad();
		var choiceSnapshot = snapshot.val();
		console.log(choiceSnapshot);
		console.log(theaterAddress);
		movieTitle = choiceSnapshot.title;
		movieDate = choiceSnapshot.date;
		movieTime = choiceSnapshot.time;
		movieTheater = choiceSnapshot.theater;

		var movieSelectionModal = $("<ul id='selectionDetails'>");
 		movieSelectionModal.append("<li>" + movieTitle + "</li><li>" + movieDate + "</li><li>" + movieTime + "</li><li>" + movieTheater + "</li><li>" + theaterAddress + "</li>");
		$("#movieOutputModal").html(movieSelectionModal);

		database.ref('/movieChoice').set({
			title: movieTitle,
			date: movieDate,
			time: movieTime,
			theater: movieTheater,
			address: theaterAddress,
			userId: userId
		});  
  	
	});
};

function findPoster(movieTitle){
	var OMDBQueryURL = "https://www.omdbapi.com/?t=" + movieTitle + "&y=2016&plot=short&r=json";
	$.ajax({url: OMDBQueryURL, method: 'GET'})
	.done(function(response){
		if (response["Poster"]){
			posterURL = response["Poster"];
		}
		else {
			posterURL = "assets/images/noposter.jpg";
		};
		$("#movieImage").attr('src', posterURL);
	});
};

