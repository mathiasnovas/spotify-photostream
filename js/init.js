//
// init.js - Initializes the app
//

(function() {
"use strict";

// Spotify API
var sp = getSpotifyApi(1),

// Create a FlickrStream object
	flickrstream = sp.require('js/flickrstream'),
	flickr = new flickrstream.FlickrStream('525b48b1850237c4010808f667523170'), // please don't abuse my API key >_>

// Settings
	intervalLength = 7000,
	playing = false,

// Current objects
	currentArtist = null,
	currentImage = null,
	imageStream = null;

// Onload
$(function() {
	update();

	// Catch player changed events
	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
		if (event.data.curtrack == true) {
			// Track has changed
			update();
		} else if (event.data.playstate == true) {
			// Playstate has changed
			if (sp.trackPlayer.getIsPlaying())
				play();
			else
				pause();
		}
	});

});

// Start the playback
function play() {
	if (imageStream !== null)
		clearTimeout(imageStream);
	playing = true;
	nextImage();
}

// Pause the playback
function pause() {
	if (imageStream !== null)
		clearTimeout(imageStream);
	playing = false;
}

// Update the stream
function update() {

	// This will be null if nothing is playing.
	var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

	if (playerTrackInfo == null) {
		pause();
		currentArtist = null;
		currentImage = null;
		$('#splash').show();
		$('#image').hide();
	} else if (playerTrackInfo.track.artists[0].name != currentArtist) {
		currentArtist = playerTrackInfo.track.artists[0].name;
		flickr.setSearchTerm(currentArtist);
		if (!imageStream && sp.trackPlayer.getIsPlaying()) {
			play();
		}
		$('#splash').hide();
		$('#image').show();
	}

}

// Go to thext next image
function nextImage() {
	flickr.next(function(image) {
		var img = new Image();

		// Load new image
		currentImage = image.url.default;
		$(img)
			.load(function () {

				// Remove existing images
				$('#image > div').fadeToggle('slow', 'swing', function() {
					$(this).remove();
				});

				// Add our image
				$('#image').append('<div id="' + image.id + '"><img src="' + currentImage + '" alt="' + currentArtist + '"><a href="' + image.link + '">' + image.title + '</a></div>');

				// Position and show image
				var imagediv = $('#image');
				var innerdiv = $('#image #' + image.id);
				innerdiv
					.css('top', ((imagediv.height() - innerdiv.height()) / 2) + 'px')
					.fadeToggle('slow');

				// Prepare next image
				if (playing)
					imageStream = setTimeout(function() {
						nextImage();
					}, intervalLength);
			})
			.error(function () {
      			console.error("Unable to load image");
    		})
    		.attr('src', currentImage);
	});
}

})();
