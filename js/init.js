//
// init.js - Initializes the app
//

sp = getSpotifyApi(1);

// Create a FlickrStream object
flickrstream = sp.require('js/flickrstream');
flickr = new flickrstream.FlickrStream('@todo');


// Onload
$(function() {

	// Catch playerStateChanged events
	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
		if (event.data.curtrack == true) {
			// Track has changed
		}
	});
});
