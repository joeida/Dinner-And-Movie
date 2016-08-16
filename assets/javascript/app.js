function findMovie(){
	var movieZip = $(this).data('zip');
	var queryURL = "http://data.tmsapi.com/v1.1/movies/showings?startDate=2016-08-16&zip=90027&api_key=w2v7bscpkzmezeny47ueqsau";

	$.ajax({url: queryURL, method: 'GET'})
	.done(function(response){
		for (var i = 0; i < 10; i++){
			console.log(response[i].title);
			console.log(response[i].ratings[0].code);
			console.log(response[i].shortDescription);
		};
	});
};

window.onload = findMovie;
//$(document).on('load', findMovie);
