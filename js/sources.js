(function () {
	"use strict";

	/**
	 * Generic image source. Not meant to be used directly.
	 *
	 * @param string apiKey API key used to connect to the source
	 */
	function ImageSource(apiKey) {
		this.apiKey = apiKey;
		this.name = "Unknown";
	};

	/**
	 * Search for images in the source.
	 *
	 * @param string artist Name of the artist to search for
	 * @param function callback Callback to call with the results
	 */
	ImageSource.prototype.search = function(artist, callback) {
		var request = new XMLHttpRequest(),
			source = this,
			query,
			url,
			params,
			queryParams;

		if (typeof artist == "undefined") {
			console.error("No search term defined");
			if (callback) {
				callback();
			}

			return;
		}

		query = this.getQuery(artist);
		url = query.url;
		params = query.params;
		queryParams = "";

		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				queryParams += (queryParams != "" ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
			}
		}

		request.onreadystatechange = function () {
			function jsonpCallback(json) {
				return json;
			};

			if (this.readyState == 4 && this.status == 200) {
				var json = eval(this.responseText),
					images = source.extractImages(json);

				if (images.length) {
					console.log("Fetched " + images.length + " image" + (images.length != 1 ? "s" : "") + " from " + source.name);
				} else {
					console.warn("No images retrieved from " + source.name);
				}

				if (callback) {
					callback(images);
				}
			}
		};
		request.addEventListener("error", function() {
			console.error(this.responseText);
		}, false);
		request.open("GET", url + queryParams, true);
		request.send();
	};

	/**
	 * Source of images from The Echo Nest
	 *
	 * @param string apiKey API key to The Echo Nest
	 */
	function EchoNestSource(apiKey) {
		ImageSource.call(this, apiKey);
		this.name = "The Echo Nest";
	}

	EchoNestSource.prototype = new ImageSource();

	/**
	* Extract the images from the response object.
	*
	* @param object response Response object
	* @return array
	*/
	EchoNestSource.prototype.extractImages = function(response) {
		var images = [],
			images,
			i;

		if (!response.response || !response.response.images || !response.response.images.length) {
			return images;
		}

		response = response.response.images;
		for (i = 0; i < response.length; i++) {
			image = {
				title: artist,
				id: "",
				link: "",
				url: response[i].url
			}

			images.push(image);
		}

		return images;
	}

	/**
	 * Get the query for the image source.
	 *
	 * @param string artist Name of the artist to search for
	 * @return object
	 */
	EchoNestSource.prototype.getQuery = function(artist) {
		return {
			url: "http://developer.echonest.com/api/v4/artist/images",
			params: {
				api_key: this.apiKey,
				format: "jsonp",
				name: artist,
				results: 10,
				callback: "jsonpCallback"
			}
		};
	};

	/**
	* Source of images from last.fm
	*
	* @param string apiKey API key to last.fm
	*/
	function LastFMSource(apiKey) {
		ImageSource.call(this, apiKey);
		this.name = "last.fm";
	}

	LastFMSource.prototype = new ImageSource();

	/**
	* Extract the images from the response object.
	*
	* @param object response Response object
	* @return array
	*/
	LastFMSource.prototype.extractImages = function(response) {
		var image,
			temp;

		if (!response.artist || !response.artist.image || !response.artist.image.length) {
			return [];
		}

		temp = response.artist.image.pop();
		image = {
			title: response.artist.name,
			link: response.artist.url,
			url: temp["#text"]
		};

		return [image];
	}

	/**
	* Get the query for the image source.
	*
	* @param string artist Name of the artist to search for
	* @return object
	*/
	LastFMSource.prototype.getQuery = function(artist) {
		return {
			url: "http://ws.audioscrobbler.com/2.0/",
			params: {
				api_key: this.apiKey,
				format: "json",
				method: "artist.getinfo",
				artist: artist,
				callback: "jsonpCallback"
			}
		};
	};

	// Export sources
	exports.EchoNestSource = EchoNestSource;
	exports.LastFMSource = LastFMSource;

})();
