//
// init.js - Initializes the app
//

sp = getSpotifyApi(1);

// Create a FlickrStream object
flickrstream = sp.require('js/flickrstream');
flickr = new flickrstream.FlickrStream('525b48b1850237c4010808f667523170'); // please don't abuse my API key >_>

// Current objects
var currentArtist = null;
var currentImage = null;

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
        $('#splash').html("Nothing playing!");
        currentArtist = null;
    } else if (playerTrackInfo.track.artists[0].name != currentArtist) {
        currentArtist = playerTrackInfo.track.artists[0].name;
        flickr.setSearchTerm(currentArtist);
        $('#splash').html(currentArtist);
    }

	/*flickr.next(function(image) {
		console.log(image);
	});*/
}

