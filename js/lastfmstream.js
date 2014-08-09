(function(){
	"use strict";

	/**
	 * Constructor
	 *
	 * @param apiKey     API Key to last.fm
	 * @param searchTerm (optional) Search term to start the stream
	 **/
	var LastFMStream = function (apiKey, searchTerm) {
		// Options
		this.options = {
			// LastFM API key
			apiKey: apiKey,

			// The search term
			searchTerm: searchTerm
		};

		// List of images
		this.images = [];

		// Current image
		this.currentImage = -1;

		if (searchTerm)
			this.setSearchTerm(searchTerm);
	};

	LastFMStream.prototype = {

		/**
		 * Get the next image in the stream, incrementing the stream.
		 *
		 * @param callback (optional) Callback which will receive the image object
		 **/
		next: function (callback) {
			var self = this;

			if (this.images.length !== 0) {
				// Get the next image
				this.currentImage = this.currentImage == this.images.length - 1 ? 0 : this.currentImage + 1;

				if (typeof callback != 'undefined')
					callback(this.images[this.currentImage]);
			} else {
				// Get the next batch of images
				this.search(function () {
					if (callback)
						self.next(callback);
				});
			}
		},

		/**
		 * Reset the stream.
		 **/
		resetStream: function () {
			this.images = [];
		},

		/**
		 * Search for images.
		 *
		 * @param callback (optional) Callback which should receive the image objects
		 **/
		search: function(callback) {
			if (!this.options.searchTerm) {
				console.error('LastFMStream::search: no search term defined');
				if (callback)
					callback();
				return;
			}

			var self = this,
				request = new XMLHttpRequest(),
				url = 'http://ws.audioscrobbler.com/2.0/',
				params = {
					api_key: this.options.apiKey,
					format: 'json',
					method: 'artist.getinfo',
					artist: this.options.searchTerm,
					callback: 'jsonLastFMApi'
				},
				query = '';
			for (var key in params) {
				query += (query != '' ? '&' : '?') + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
			}


			request.onreadystatechange = function () {
				function jsonLastFMApi(json) {
					return json;
				};

				if (this.readyState == 4 && this.status == 200 ) {
					var json = eval(this.responseText),
						artist = json.artist,
						image = {};

					console.log('Fetched artist from Last.FM', artist);

					image.title = artist.name;
					image.id = artist.mbid;
					image.link = artist.url;
					image.url = '';

					if (artist.image.length) {
						var temp = artist.image.pop();
						image.url = temp['#text'];
					}

					self.images = [image];

					if (callback)
						callback();
				}
			};
			request.addEventListener("error", function() {
				console.error(this.responseText);
			}, false);
			request.open('GET', url + query, true);
			request.send();
		},

		/**
		 * Set the search term and reset the stream.
		 *
		 * @param searchTerm The search term
		 **/
		setSearchTerm: function (searchTerm) {
			this.options.searchTerm = searchTerm;
			this.resetStream();
		}

	}

	// Add it to the scope
	exports.LastFMStream = LastFMStream;

})();
