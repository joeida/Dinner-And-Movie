var database = firebase.database();

//Creating needed global variables.
var theaterAddress = "";
var showtime = "";
var movieTitle = "";
var movieTime = "";
var movieTheater = "";
var movieDate = "";

console.log("showtimeContainer")


//API keys for OnConnect.
apiKey1 = "w2v7bscpkzmezeny47ueqsau"
apiKey2 = "93dvq9k3hx7ahh997jb5tyd2"
apiKey3 = "9vu3zjqxjwg49mm9p72mqjau"
apiKey4 = "adf7jebmw23v6yjr6f6qcqsf"

//When enter zip, find movies, clear database, empty anything that was in movieCntainer.
//Hide unneeded buttons and containers.
$('#zipInput').on('click', function(){
	var movieZip = $('#zipCode').val().trim();
	database.ref('/movieOptions').remove();
	$("#movieContainer").empty();
	findMovie(movieZip);
	$('#zipCode').val('');
	$("#backbutton1").hide();
	$("#backbutton2").hide();
	$("#movieContainer").show();
	$("#showtimeContainer").hide();
	$("#selectionContainer").hide();
	return false;
});

//When click on movie choice, find showtimes, empty anything that was in showtimeContainer.
//Hide unneeded buttons and containers.
$("#movieContainer").on("click", ".movie", function(){
	var movie = $(this).data(movie);
	$("#showtimeContainer").empty();
	findShowtimes(movie);
	$("#backbutton1").show();
	$("#backbutton2").hide();
	$("#movieContainer").hide();
	$("#showtimeContainer").show();
	$("#selectionContainer").hide();
});

//When click on showtime choice, find address of theater, empty selectionContainer.
//Hide unneeded buttons and containers.
$("#showtimeContainer").on("click", ".showtime", function(){
	var showtime = $(this).data(showtime);
	database.ref('/movieChoice').set({
				title: showtime.title,
				date: showtime.date,
				time: showtime.time,
				theater: showtime.theater
			});	
	$("#selectionContainer").empty();
	findAddress(showtime);
	$("#backbutton1").hide();
	$("#backbutton2").show();
	$("#movieContainer").hide();
	$("#showtimeContainer").hide();
	$("#selectionContainer").show();
});

//Back button that allows you to pick a different movie.
$("#backbutton1").on("click", function(){
	$("#backbutton1").hide();
	$("#backbutton2").hide();
	$("#movieContainer").show();
	$("#showtimeContainer").hide();
	$("#selectionContainer").hide();
});

//Back button that allows you to pick a different showtime.
$("#backbutton2").on("click", function(){
	$("#backbutton1").show();
	$("#backbutton2").hide();
	$("#movieContainer").hide();
	$("#showtimeContainer").show();
	$("#selectionContainer").hide();
});

//Take zip code and query OnConnect for movies playing nearby. Store movie info in each button.
//Disply movie info. Also get showtimes for each movie for later display.
function findMovie(movieZip){
	var date = moment().format("YYYY-MM-DD");
	var onConnectQueryURL = "https://data.tmsapi.com/v1.1/movies/showings?startDate=" + date + "&zip=" + movieZip + "&api_key=" + apiKey1;
	//if using lat/long, phrasing is: lat=34.0736&lng=-118.4004
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
					theater: movieTheater
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
			console.log(showtimeContainer)
			console.log(findPoster)
			findPoster(movieTitle);
		};
	});						
};
function findAddress(showtime){	

  	var losfeliz = new google.maps.LatLng(34.1063,-118.2848);
	var map = new google.maps.Map(document.getElementById('mapdiv'), {
     	//center: losfeliz,
    });

	var request = {
    	// location: losfeliz,
    	// radius: '500',
    	query: showtime.theater,
    	type: 'movie_theater'
  	};
  	var service = new google.maps.places.PlacesService($('#mapdiv').get(0));
	service.textSearch(request, callbackAddress);
};
		
function callbackAddress(results, status) {
  	if (status == google.maps.places.PlacesServiceStatus.OK) {
    	theaterAddress = results[0].formatted_address;
    	displaySelection(theaterAddress);
    };
 };

 function displaySelection(){
 	var choice = database.ref('/movieChoice');
	choice.on("value", function(snapshot){
		var choiceSnapshot = snapshot.val();
		movieTitle = choiceSnapshot.title;
		movieDate = choiceSnapshot.date;
		movieTime = choiceSnapshot.time;
		movieTheater = choiceSnapshot.theater;	
 		var selectionBlock = $("<h3>" + movieTitle + "</h3>" + movieDate + "<br>" + movieTime + "<br>" + movieTheater + "<br>" + theaterAddress + "<br>");
				
						console.log("test")
						console.log(selectionContainer)
		$("#selectionContainer").html(selectionBlock);
 		$("#showtimeContainer").hide();
    	database.ref('/movieChoice').set({
			title: movieTitle,
			date: movieDate,
			time: movieTime,
			theater: movieTheater,
			address: theaterAddress
		});  	
	});
};

function findPoster(movieTitle){
	var OMDBQueryURL = "http://www.omdbapi.com/?t=" + movieTitle + "&y=2016&plot=short&r=json";
	$.ajax({url: OMDBQueryURL, method: 'GET'})
	.done(function(response){
		if (response["Poster"]){
			var posterURL = response["Poster"];
		}
		else {
			var posterURL = "../images/noposter.jpg";
		};
		$("#movieImage").attr('src', posterURL);
	});
};

$(document).ready(function(){
	$("#backbutton1").hide();
	$("#backbutton2").hide();
});
