//
// init.js - Initializes the app
//

sp = getSpotifyApi(1);

// Create a FlickrStream object
flickrstream = sp.require('js/flickrstream');
flickr = new flickrstream.FlickrStream('525b48b1850237c4010808f667523170'); // please don't abuse my API key >_>

// Settings
intervalLength = 5000;

// Current objects
var currentArtist = null;
var currentImage = null;
var imageStream = null;

// Onload
$(function() {
	update();

	// Catch player changed events
	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
		if (event.data.curtrack == true) {
			// Track has changed
			update();
		}
	});

});

// Update the stream
function update() {

	// This will be null if nothing is playing.
	var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

	if (playerTrackInfo == null) {
		$('#splash').html("Play some music to start the slideshow");
		currentArtist = null;
		clearInterval(imageStream);
		imageStream = null;
	} else if (playerTrackInfo.track.artists[0].name != currentArtist) {
		currentArtist = playerTrackInfo.track.artists[0].name;
		flickr.setSearchTerm(currentArtist);
		if (!imageStream)
			imageStream = setInterval('nextImage()', intervalLength);
	}

}

// Go to thext next image
function nextImage() {
	flickr.next(function(image) {
		currentImage = image.url.default;
		console.log(currentImage);
		$('#splash').html('<img src="' + currentImage + '" alt="' + currentArtist + '">');
	});
}
