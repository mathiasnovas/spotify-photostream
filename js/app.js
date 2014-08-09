(function() {
	"use strict";

	// Includes
	var sp = getSpotifyApi(1),
		lastfmstream = sp.require('js/lastfmstream');

	// The app itself
	var app = {

		// Last.fm stream
		lastfm: new lastfmstream.LastFMStream('dd1d56c289c3bb533e1b4371fb99bd32'), // please don't abuse my API key ^^

		// Settings
		intervalLength: 7000,
		playing: false,

		// Current objects
		currentArtist: null,
		currentImage: null,
		imageStream: null,

		/**
		 * Start the application.
		 */
		init: function() {
			app.update();

			// Catch player changed events
			sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
				if (event.data.curtrack == true) {
					// Track has changed
					app.update();
				} else if (event.data.playstate == true) {
					// Playstate has changed
					if (sp.trackPlayer.getIsPlaying())
						app.play();
					else
						app.pause();
				}
			});

		},

		// Go to thext next image
		nextImage: function() {
			app.lastfm.next(function(image) {
				var img = new Image();

				// Load new image
				app.currentImage = image.url;

				img.onload = function() {
					var imageDiv = document.getElementById('image'),
						existingImages = document.querySelectorAll('#image > div'),
						newImage = document.createElement('div');

					if (existingImages.length) {
						for (var i = 0; i < existingImages.length; i++) {
							existingImages[i].style.opacity = 0;
						}
						setTimeout(function() {
							for (var i = 0; i < existingImages.length; i++) {
								existingImages[i].remove();
							}
						}, 1000);
					}

					// Create new image div
					newImage.id = image.id;
					newImage.innerHTML = '<img src="' + app.currentImage + '" alt="' + app.currentArtist + '">';
					imageDiv.appendChild(newImage);

					// Position & show new image
					newImage.style.top = Math.floor((imageDiv.scrollHeight - img.height) / 2) + 'px';
					newImage.style.opacity = 1;

					// Prepare next image
					if (app.playing)
						app.imageStream = setTimeout(function() {
							app.nextImage();
						}, app.intervalLength);
				}
				img.src = app.currentImage;

			});
		},

		// Start the playback
		play: function() {
			if (app.imageStream !== null)
				clearTimeout(app.imageStream);
			app.playing = true;
			app.nextImage();
		},

		// Pause the playback
		pause: function() {
			if (app.imageStream !== null)
				clearTimeout(app.imageStream);
			app.playing = false;
		},

		// Update the stream
		update: function() {

			// This will be null if nothing is playing.
			var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

			if (playerTrackInfo == null) {
				app.pause();
				app.currentArtist = null;
				app.currentImage = null;
				document.getElementById('artist').innerHTML = 'Waiting for music...';
				document.getElementById('image').style.display = 'none';
			} else if (playerTrackInfo.track.artists[0].name != app.currentArtist) {
				app.currentArtist = playerTrackInfo.track.artists[0].name;
				app.lastfm.setSearchTerm(app.currentArtist);
				if (!app.imageStream && sp.trackPlayer.getIsPlaying()) {
					app.play();
				}
				document.getElementById('artist').innerHTML = app.currentArtist;
				document.getElementById('image').style.display = 'block';
			}

		}

	};

	window.onload = function() {
		// Let's do this!
		app.init();
	}

})();
