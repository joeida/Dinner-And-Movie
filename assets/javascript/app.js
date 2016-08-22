var config = {
    apiKey: "AIzaSyA843-SLudIotSIbgl0I6QwUsYvJVKY9Kg",
    authDomain: "dinner-and-a-movie-4fba2.firebaseapp.com",
    databaseURL: "https://dinner-and-a-movie-4fba2.firebaseio.com",
    storageBucket: "dinner-and-a-movie-4fba2.appspot.com",
  };
  firebase.initializeApp(config);

var database = firebase.database();


apiKey1 = "w2v7bscpkzmezeny47ueqsau"
apiKey2 = "93dvq9k3hx7ahh997jb5tyd2"
apiKey3 = "9vu3zjqxjwg49mm9p72mqjau"

$('#zipInput').on('click', function(){
	var movieZip = $('#zipCode').val().trim();
	database.ref().remove();
	$('#zipCode').val('');
	
	findMovie(movieZip);
	return false;
});

$("#movieContainer").on("click", ".movie", function(){
	var movie = $(this).data(movie);
	findShowtimes(movie);
});

$("#showtimeContainer").on("click", ".showtime", function(){
	var showtime = $(this).data(showtime);
	console.log(showtime);
	findAddress(showtime);
});


function displayMovie() {
	var movieBlock = $("<div>");
	$("#movieContainer").append("<h3>" + movie + "</h3>" + theater + "<br>" + date + "<br>" + time + "<br>");
};

function findMovie(movieZip){
	var date = moment().format("YYYY-MM-DD");
	var onConnectQueryURL = "https://data.tmsapi.com/v1.1/movies/showings?startDate=" + date + "&zip=" + movieZip + "&api_key=" + apiKey3;
	
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
					var date = dateTimeArray[0];
					var time = dateTimeArray[1];
					var movieTime = moment(time, 'hh:mm').format("h:mm a");
				}
				else {
					showtime = "No Showtime";
					date = "No Date";
					time = "No Showtime";
				};
				var theater;
				if (response[i].showtimes[j]) {
					theater = response[i].showtimes[j].theatre.name;
				}
				else {
					theater = "No Theater";
				};

				database.ref().push({
					title: movieTitle,
					date: date,
					time: movieTime,
					theater: theater
				});
			};
		};
	});
};

function findShowtimes(movie){			
	var data = database.ref();
	data.on("child_added", function(snapshot){
		var snapshot = snapshot.val();
		var movieTitle = snapshot.title;
		var date = snapshot.date;
		var time = snapshot.time;
		var time = time
		var theater = snapshot.theater;
		if (movieTitle == movie.title){
			var showtimeBlock = $("<h3>" + movieTitle + "</h3>" + time + "<br>" + theater + "</br>");
			var showtimeButton = $("<button>");
			showtimeButton.text("Select Showtime");
			showtimeButton.addClass("showtime");
			showtimeButton.attr("data-title", movieTitle);
			showtimeButton.attr("data-theater", theater);
			showtimeButton.attr("data-time", time);
			$("#showtimeContainer").append(showtimeBlock);
			$("#showtimeContainer").append(showtimeButton);
			$("#movieContainer").hide();
		}; 
	});						
};

function displaySelection(showtime){
	
	findAddress(theater);
	console.log(theaterAddress);
}

function findAddress(showtime){
	//console.log(showtime);
	var theater = showtime.theater;
	//console.log(theater);
	var googleQueryURL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + theater + "&type=movie_theater&key=AIzaSyBCXM-2P4McxM6KX4Nr4dURfIYOVSUKhPo";

	$.ajax({
		url : googleQueryURL,
		method : 'GET'
	})
	.done(function(response){
		var theaterAddress = response.results[0].formatted_address;
		console.log(theaterAddress);
		return theaterAddress;
	});
};

function findPoster(){
	var movie = "cafesociety";
	var TMDBQueryURL = "http://api.themoviedb.org/search/" + movie + "?api_key=69ab51287c6662e8557a3456899a4efb";

	$.ajax({url: TMDBQueryURL, method: 'GET'})
	.done(function(response){
		var posterURL = "https://image.tmdb.org/t/p/original/" + response.poster_path;
		console.log(response.poster_path);
		$("#movieImage").attr('src', posterURL);
	});
};

