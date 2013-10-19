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
window.onload = function() {
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

}

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
		document.getElementById('splash').style.display = 'block';
		document.getElementById('image').style.display = 'none';
	} else if (playerTrackInfo.track.artists[0].name != currentArtist) {
		currentArtist = playerTrackInfo.track.artists[0].name;
		flickr.setSearchTerm(currentArtist);
		if (!imageStream && sp.trackPlayer.getIsPlaying()) {
			play();
		}
		document.getElementById('splash').style.display = 'none';
		document.getElementById('image').style.display = 'block';
	}

}

// Go to thext next image
function nextImage() {
	console.log('nextImage');
	flickr.next(function(image) {
		var img = new Image();

		// Load new image
		currentImage = image.url.default;

		img.onload = function() {
			var imageDiv = document.getElementById('image'),
				divs = document.querySelectorAll('#image > div'),
				newImage = document.createElement('div');
			for (var i = 0; i < divs.length; i++) {
				divs[i].remove();
			}

			// Create new image div
			newImage.id = image.id;
			newImage.innerHTML = '<img src="' + currentImage + '" alt="' + currentArtist + '"><a href="' + image.link + '">' + image.title + '</a>';
			imageDiv.appendChild(newImage);

			// Position & show new image
			newImage.style.top = Math.floor((imageDiv.scrollHeight - img.height) / 2) + 'px';
			newImage.style.display = 'block';

			// Prepare next image
			if (playing)
				imageStream = setTimeout(function() {
					nextImage();
				}, intervalLength);
		}
		img.src = currentImage;

	});
}

})();
