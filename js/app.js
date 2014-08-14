(function() {
	"use strict";

	var sp = getSpotifyApi(1),
		sources = sp.require("js/sources");

	var app = {

		currentArtist: "",
		elements: {},
		images: [],
		intervalLength: 15000,
		nextImageTimeout: undefined,
		sources: [
			// please don't abuse my API keys ^^
			new sources.LastFMSource("dd1d56c289c3bb533e1b4371fb99bd32"),
			new sources.EchoNestSource("OU8TJJNV96BYN11BX")
		],

		/**
		 * Get the currently playing track.
		 */
		getCurrentTrack: function () {
			var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

			if (playerTrackInfo != null && playerTrackInfo.track.artists[0].name) {
				this.updateArtist(playerTrackInfo.track.artists[0].name);
			} else {
				this.updateArtist("");
			}
		},

		/**
		 * Initialize the application.
		 */
		init: function () {
			// DOM elements
			this.elements.images = document.getElementById("image");
			this.elements.artist = document.getElementById("artist");

			// Catch player changed events
			sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
				this.getCurrentTrack();
			}.bind(this));

			this.getCurrentTrack();
		},

		/**
		 * Load the images for the current artist.
		 */
		loadImages: function () {
			var sources = this.sources.length,
				receiveImages = function (images) {
					if (images) {
						this.images = this.images.concat(images);
					}

					if (--sources <= 0) {
						this.nextImage();
					}
				},
				i;

				for (i = 0; i < sources; i++) {
					this.sources[i].search(this.currentArtist, receiveImages.bind(this));
				}
		},

		/**
		 * Show the next image.
		 */
		nextImage: function () {
			var currentImage,
				image,
				index;

			if (this.nextImageTimeout) {
				clearTimeout(this.nextImageTimeout);
				this.nextImageTimeout = undefined;
			}

			console.log("Next image");

			if (!this.images.length) {
				console.warn("No images to display");
				this.removeImages();
				return;
			}

			index = Math.floor(Math.random() * (this.images.length));
			currentImage = this.images[index];
			image = new Image();

			image.onload = function() {
				var imageContainer = document.createElement("div");

				this.removeImages();

				imageContainer.id = currentImage.id;
				imageContainer.style.backgroundImage = "url('" + currentImage.url + "')"
				this.elements.images.appendChild(imageContainer);

				setTimeout(function () {
					imageContainer.className = "current";
				}, 100); // allow for the fade effect

				this.nextImageTimeout = setTimeout(function() {
					app.nextImage();
				}, app.intervalLength);
			}.bind(this);

			image.src = currentImage.url;
		},

		/**
		 * Remove existing images.
		 */
		removeImages: function () {
			var existingImages = this.elements.images.querySelectorAll("#image > div");

			if (existingImages.length) {
				for (var i = 0; i < existingImages.length; i++) {
					existingImages[i].className = "";
				}
				setTimeout(function() {
					for (var i = 0; i < existingImages.length; i++) {
						existingImages[i].remove();
					}
				}, 1000);
			}
		},

		/**
		 * Update the currently playing artist.
		 *
		 * @param string artist New artist to use
		 */
		updateArtist: function (artist) {
			if (this.currentArtist == artist) {
				return;
			}

			this.currentArtist = artist;
			this.images = [];

			if (artist != "") {
				console.log("Update artist: " + artist);

				this.elements.artist.innerHTML = artist;
				this.loadImages();
			} else {
				this.elements.artist.innerHTML = "Waiting for music...";
			}
		}

	};

	window.onload = function () {
		app.init();
	};

})();
