//
// init.js - Initializes the app
//

sp = getSpotifyApi(1);

// Create a FlickrStream object
flickrstream = sp.require('js/flickrstream');
flickr = new flickrstream.FlickrStream('525b48b1850237c4010808f667523170', 'Rise to Remain'); // please don't abuse my API key >_>

// Onload
$(function() {

	flickr.next(function(image) {
		console.log(image);
	});

	// Catch playerStateChanged events
	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
		if (event.data.curtrack == true) {
			// Track has changed
		}
	});
});

