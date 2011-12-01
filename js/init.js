//
// init.js - Initializes the app
//

sp = getSpotifyApi(1);

// Create a FlickrStream object
flickrstream = sp.require('js/flickrstream');
flickr = new flickrstream.FlickrStream('525b48b1850237c4010808f667523170'); // please don't abuse my API key >_>

// Settings
intervalLength = 7000;

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
		clearInterval(imageStream);
		currentArtist = null;
		currentImage = null;
		imageStream = null;
		$('#splash').show();
		$('#image').hide();
	} else if (playerTrackInfo.track.artists[0].name != currentArtist) {
		currentArtist = playerTrackInfo.track.artists[0].name;
		flickr.setSearchTerm(currentArtist);
		if (!imageStream) {
			nextImage();
			imageStream = setInterval('nextImage()', intervalLength);
		}
		$('#splash').hide();
		$('#image').show();
	}

}

// Go to thext next image
function nextImage() {
	flickr.next(function(image) {
		currentImage = image.url.default;
		console.log(currentImage);
		$('#image').html('<img src="' + currentImage + '" alt="' + currentArtist + '">');
	});
}
